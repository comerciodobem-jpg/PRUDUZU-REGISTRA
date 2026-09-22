import { randomUUID } from "node:crypto";
import {
  calculateDifference,
  calculateMaterialConsumption,
  selectUnambiguousNeed,
} from "../../domain/rules";
import type {
  AuditEvent,
  Product,
  ProductionNeed,
  ProductionRecord,
  ProductionReview,
  SessionActor,
  StockMovement,
} from "../../domain/types";
import type { ProductionRepository, ReviewCommit } from "../repositories/contracts";

export interface RecordProductionInput {
  barcode: string;
  quantity: number;
  idempotencyKey: string;
  sourceDeviceId?: string;
  localRecordedAt?: string;
}

export interface ReviewProductionInput {
  productId: string;
  confirmedQuantity: number;
  idempotencyKey: string;
  notes?: string;
}

export interface VisibleNeed extends ProductionNeed {
  remainingQuantity: number;
}

export interface PendingReviewContributor {
  employeeId: string;
  userId: string;
  name: string;
  quantity: number;
  recordCount: number;
}

export interface PendingReviewGroup {
  product: Product;
  declaredTotal: number;
  recordCount: number;
  contributors: PendingReviewContributor[];
  oldestRecordedAt: string;
}

export class ProductionServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ProductionServiceError";
  }
}

function ensurePermission(actor: SessionActor, permission: string): void {
  if (!actor.permissions.includes(permission)) {
    throw new ProductionServiceError("FORBIDDEN", "Ação não permitida.", 403);
  }
}

function ensureAnyPermission(actor: SessionActor, permissions: string[]): void {
  if (!permissions.some((permission) => actor.permissions.includes(permission))) {
    throw new ProductionServiceError("FORBIDDEN", "Ação não permitida.", 403);
  }
}

function ensurePositiveQuantity(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ProductionServiceError(
      "INVALID_QUANTITY",
      "A quantidade deve ser maior que zero.",
      422,
    );
  }
}

function ensureIdempotencyKey(value: string): void {
  if (!value || value.trim().length < 8) {
    throw new ProductionServiceError(
      "INVALID_IDEMPOTENCY_KEY",
      "Chave de idempotência inválida.",
      422,
    );
  }
}

function audit(
  actor: SessionActor,
  action: string,
  entityType: string,
  entityId: string,
  after?: unknown,
  before?: unknown,
  reason?: string,
): AuditEvent {
  return {
    id: randomUUID(),
    companyId: actor.companyId,
    actorUserId: actor.userId,
    action,
    entityType,
    entityId,
    before,
    after,
    reason,
    timestamp: new Date().toISOString(),
  };
}

export class ProductionService {
  constructor(
    private readonly repository: ProductionRepository,
    private readonly options: { allowSelfReview: boolean } = {
      allowSelfReview: false,
    },
  ) {}

  async lookupProduct(actor: SessionActor, barcode: string): Promise<Product> {
    ensurePermission(actor, "production.record");
    const product = await this.repository.findProductByBarcode(
      actor.companyId,
      barcode.trim(),
    );
    if (!product || !product.active) {
      throw new ProductionServiceError(
        "PRODUCT_NOT_FOUND",
        "Produto não encontrado ou inativo.",
        404,
      );
    }
    return product;
  }

  async listVisibleRecords(actor: SessionActor): Promise<ProductionRecord[]> {
    ensureAnyPermission(actor, ["production.read.self", "production.read.team"]);
    const records = await this.repository.listRecords(actor.companyId);
    const visible = actor.permissions.includes("production.read.team")
      ? records
      : records.filter((record) => record.userId === actor.userId);

    return visible.toSorted(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
  }

  async listNeeds(actor: SessionActor): Promise<VisibleNeed[]> {
    ensurePermission(actor, "production.need.read");
    const needs = await this.repository.listActiveNeeds(actor.companyId);
    return needs.map((need) => ({
      ...need,
      remainingQuantity: Math.max(
        0,
        need.targetQuantity - need.confirmedProgressQuantity,
      ),
    }));
  }

  async listPendingReviewGroups(
    actor: SessionActor,
  ): Promise<PendingReviewGroup[]> {
    ensurePermission(actor, "production.review");

    const records = (await this.repository.listRecords(actor.companyId)).filter(
      (record) => record.reviewStatus === "PENDING_REVIEW",
    );
    const byProduct = new Map<string, ProductionRecord[]>();

    for (const record of records) {
      const current = byProduct.get(record.productId) ?? [];
      current.push(record);
      byProduct.set(record.productId, current);
    }

    const groups: PendingReviewGroup[] = [];

    for (const [productId, productRecords] of byProduct) {
      const product = await this.repository.findProductById(
        actor.companyId,
        productId,
      );
      if (!product) continue;

      const contributorMap = new Map<string, PendingReviewContributor>();
      for (const record of productRecords) {
        const contributorKey = `${record.userId}:${record.employeeId}`;
        const existing = contributorMap.get(contributorKey);
        if (existing) {
          existing.quantity += record.declaredQuantity;
          existing.recordCount += 1;
        } else {
          contributorMap.set(contributorKey, {
            employeeId: record.employeeId,
            userId: record.userId,
            name: record.recordedByName,
            quantity: record.declaredQuantity,
            recordCount: 1,
          });
        }
      }

      groups.push({
        product,
        declaredTotal: productRecords.reduce(
          (sum, record) => sum + record.declaredQuantity,
          0,
        ),
        recordCount: productRecords.length,
        contributors: [...contributorMap.values()],
        oldestRecordedAt: productRecords
          .map((record) => record.recordedAt)
          .toSorted()[0],
      });
    }

    return groups.toSorted(
      (a, b) =>
        new Date(a.oldestRecordedAt).getTime() -
        new Date(b.oldestRecordedAt).getTime(),
    );
  }

  async recordProduction(
    actor: SessionActor,
    input: RecordProductionInput,
  ): Promise<ProductionRecord> {
    ensurePermission(actor, "production.record");
    ensureIdempotencyKey(input.idempotencyKey);
    ensurePositiveQuantity(input.quantity);

    const existing = await this.repository.findRecordByIdempotency(
      actor.companyId,
      input.idempotencyKey,
    );
    if (existing) {
      if (
        existing.barcode !== input.barcode ||
        existing.declaredQuantity !== input.quantity
      ) {
        throw new ProductionServiceError(
          "IDEMPOTENCY_CONFLICT",
          "A chave já foi usada com outro registro.",
          409,
        );
      }
      return existing;
    }

    const product = await this.lookupProduct(actor, input.barcode);

    const needs = await this.repository.listActiveNeeds(
      actor.companyId,
      product.id,
    );
    const selectedNeed = selectUnambiguousNeed(product.id, needs);
    const now = new Date().toISOString();

    const record: ProductionRecord = {
      id: randomUUID(),
      companyId: actor.companyId,
      userId: actor.userId,
      employeeId: actor.employeeId,
      recordedByName: actor.name,
      productId: product.id,
      barcode: product.barcode,
      declaredQuantity: input.quantity,
      unit: product.controlUnit,
      recordedAt: now,
      localRecordedAt: input.localRecordedAt,
      syncStatus: "SYNCED",
      reviewStatus: "PENDING_REVIEW",
      sourceDeviceId: input.sourceDeviceId,
      productionNeedId: selectedNeed?.id,
      idempotencyKey: input.idempotencyKey,
    };

    const auditEvents: AuditEvent[] = [
      audit(actor, "production.recorded", "ProductionRecord", record.id, {
        productId: product.id,
        declaredQuantity: input.quantity,
        productionNeedId: selectedNeed?.id ?? null,
      }),
    ];

    if (needs.length > 1 && !selectedNeed) {
      auditEvents.push(
        audit(
          actor,
          "production.need.ambiguous",
          "Product",
          product.id,
          { candidateNeedIds: needs.map((need) => need.id) },
          undefined,
          "Mais de uma necessidade ativa para o mesmo produto; vínculo automático omitido.",
        ),
      );
    }

    return this.repository.createRecord(record, auditEvents);
  }

  async reviewProduction(
    actor: SessionActor,
    input: ReviewProductionInput,
  ): Promise<ProductionReview> {
    ensurePermission(actor, "production.review");
    ensureIdempotencyKey(input.idempotencyKey);
    ensurePositiveQuantity(input.confirmedQuantity);

    const existing = await this.repository.findReviewByIdempotency(
      actor.companyId,
      input.idempotencyKey,
    );
    if (existing) {
      if (
        existing.productId !== input.productId ||
        existing.confirmedQuantity !== input.confirmedQuantity
      ) {
        throw new ProductionServiceError(
          "IDEMPOTENCY_CONFLICT",
          "A chave já foi usada com outra conferência.",
          409,
        );
      }
      return existing;
    }

    const allRecords = await this.repository.listRecords(actor.companyId);
    const records = allRecords.filter(
      (record) =>
        record.productId === input.productId &&
        record.reviewStatus === "PENDING_REVIEW",
    );

    if (records.length === 0) {
      throw new ProductionServiceError(
        "PENDING_REVIEW_NOT_FOUND",
        "Não há registros pendentes para este produto.",
        404,
      );
    }

    if (
      !this.options.allowSelfReview &&
      records.some((record) => record.userId === actor.userId)
    ) {
      throw new ProductionServiceError(
        "SELF_REVIEW_BLOCKED",
        "Quem registrou esta produção não pode aprová-la.",
        403,
      );
    }

    const declaredTotal = records.reduce(
      (total, record) => total + record.declaredQuantity,
      0,
    );
    const differenceQuantity = calculateDifference(
      declaredTotal,
      input.confirmedQuantity,
    );
    const status: ProductionReview["status"] =
      differenceQuantity === 0 ? "CONFIRMED" : "DIVERGENT";
    const reviewedAt = new Date().toISOString();

    const review: ProductionReview = {
      id: randomUUID(),
      companyId: actor.companyId,
      productId: input.productId,
      declaredTotal,
      confirmedQuantity: input.confirmedQuantity,
      differenceQuantity,
      reviewerUserId: actor.userId,
      reviewedAt,
      status,
      notes: input.notes,
      idempotencyKey: input.idempotencyKey,
    };

    const finishedBefore = await this.repository.getFinishedStock(
      actor.companyId,
      input.productId,
    );
    const finishedStockAfter = finishedBefore + input.confirmedQuantity;

    const movements: StockMovement[] = [
      {
        id: randomUUID(),
        companyId: actor.companyId,
        itemId: input.productId,
        type: "FINISHED_GOODS_IN",
        quantity: input.confirmedQuantity,
        referenceId: review.id,
        createdAt: reviewedAt,
      },
    ];
    const auditEvents: AuditEvent[] = [];
    const materialStockAfter: Record<string, number> = {};

    const sheet = await this.repository.getTechnicalSheet(
      actor.companyId,
      input.productId,
    );

    if (sheet) {
      for (const item of sheet.items) {
        const availableQuantity = await this.repository.getMaterialStock(
          actor.companyId,
          item.materialId,
        );
        const consumption = calculateMaterialConsumption({
          confirmedQuantity: input.confirmedQuantity,
          quantityPerBase: item.quantityPerBase,
          availableQuantity,
        });

        materialStockAfter[item.materialId] = consumption.remainingQuantity;

        if (consumption.consumedQuantity > 0) {
          movements.push({
            id: randomUUID(),
            companyId: actor.companyId,
            itemId: item.materialId,
            type: "MATERIAL_CONSUMED",
            quantity: consumption.consumedQuantity,
            referenceId: review.id,
            createdAt: reviewedAt,
          });
        }

        if (consumption.shortageQuantity > 0) {
          movements.push({
            id: randomUUID(),
            companyId: actor.companyId,
            itemId: item.materialId,
            type: "MATERIAL_SHORTAGE",
            quantity: consumption.shortageQuantity,
            referenceId: review.id,
            createdAt: reviewedAt,
          });
          auditEvents.push(
            audit(
              actor,
              "stock.material_shortage_detected",
              "Material",
              item.materialId,
              {
                requiredQuantity: consumption.requiredQuantity,
                consumedQuantity: consumption.consumedQuantity,
                shortageQuantity: consumption.shortageQuantity,
                technicalSheetId: sheet.id,
                technicalSheetVersion: sheet.version,
              },
              { availableQuantity },
              "Produção física confirmada com saldo teórico insuficiente.",
            ),
          );
        }
      }
    }

    auditEvents.push(
      audit(
        actor,
        "production.reviewed",
        "ProductionReview",
        review.id,
        {
          productId: input.productId,
          declaredTotal,
          confirmedQuantity: input.confirmedQuantity,
          differenceQuantity,
          technicalSheetId: sheet?.id ?? null,
          technicalSheetVersion: sheet?.version ?? null,
        },
      ),
    );

    if (differenceQuantity !== 0) {
      auditEvents.push(
        audit(actor, "production.divergence_detected", "ProductionReview", review.id, {
          declaredTotal,
          confirmedQuantity: input.confirmedQuantity,
          differenceQuantity,
        }),
      );
    }

    const needIds = records.map((record) => record.productionNeedId ?? null);
    const firstNeedId = needIds[0];
    const allSameNeed =
      firstNeedId !== null && needIds.every((needId) => needId === firstNeedId);

    const commit: ReviewCommit = {
      actor,
      review,
      recordIds: records.map((record) => record.id),
      finishedStockAfter,
      materialStockAfter,
      movements,
      auditEvents,
      needProgress: allSameNeed
        ? {
            needId: firstNeedId,
            confirmedDelta: input.confirmedQuantity,
          }
        : undefined,
    };

    return this.repository.commitReview(commit);
  }
}
