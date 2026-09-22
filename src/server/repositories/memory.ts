import type {
  AuditEvent,
  Product,
  ProductionNeed,
  ProductionRecord,
  ProductionReview,
  StockMovement,
  TechnicalSheet,
} from "../../domain/types";
import type {
  ProductionRepository,
  RepositorySeed,
  ReviewCommit,
} from "./contracts";

function key(companyId: string, itemId: string): string {
  return `${companyId}:${itemId}`;
}

export class MemoryProductionRepository implements ProductionRepository {
  private readonly products: Product[];
  private readonly needs: ProductionNeed[];
  private readonly technicalSheets: TechnicalSheet[];
  private readonly finishedStock: Map<string, number>;
  private readonly materialStock: Map<string, number>;
  private readonly records: ProductionRecord[] = [];
  private readonly reviews: ProductionReview[] = [];
  private readonly movements: StockMovement[] = [];
  private readonly audits: AuditEvent[] = [];

  constructor(seed: RepositorySeed) {
    this.products = structuredClone(seed.products);
    this.needs = structuredClone(seed.needs);
    this.technicalSheets = structuredClone(seed.technicalSheets);
    this.finishedStock = new Map(Object.entries(seed.finishedStock));
    this.materialStock = new Map(Object.entries(seed.materialStock));
  }

  async findProductByBarcode(companyId: string, barcode: string): Promise<Product | null> {
    const found = this.products.find(
      (product) => product.companyId === companyId && product.barcode === barcode,
    );
    return found ? structuredClone(found) : null;
  }

  async findRecordByIdempotency(
    companyId: string,
    idempotencyKey: string,
  ): Promise<ProductionRecord | null> {
    const found = this.records.find(
      (record) =>
        record.companyId === companyId && record.idempotencyKey === idempotencyKey,
    );
    return found ? structuredClone(found) : null;
  }

  async createRecord(
    record: ProductionRecord,
    auditEvents: AuditEvent[],
  ): Promise<ProductionRecord> {
    const existing = await this.findRecordByIdempotency(
      record.companyId,
      record.idempotencyKey,
    );
    if (existing) return existing;

    this.records.push(structuredClone(record));
    this.audits.push(...structuredClone(auditEvents));

    if (record.productionNeedId) {
      const need = this.needs.find(
        (candidate) =>
          candidate.companyId === record.companyId &&
          candidate.id === record.productionNeedId,
      );
      if (need) {
        need.registeredProgressQuantity += record.declaredQuantity;
        if (need.status === "OPEN") need.status = "IN_PROGRESS";
      }
    }

    return structuredClone(record);
  }

  async listRecords(companyId: string): Promise<ProductionRecord[]> {
    return structuredClone(this.records.filter((record) => record.companyId === companyId));
  }

  async listActiveNeeds(companyId: string, productId?: string): Promise<ProductionNeed[]> {
    return structuredClone(
      this.needs.filter(
        (need) =>
          need.companyId === companyId &&
          (!productId || need.productId === productId) &&
          (need.status === "OPEN" || need.status === "IN_PROGRESS"),
      ),
    );
  }

  async getTechnicalSheet(
    companyId: string,
    productId: string,
  ): Promise<TechnicalSheet | null> {
    const found = this.technicalSheets.find(
      (sheet) => sheet.companyId === companyId && sheet.productId === productId,
    );
    return found ? structuredClone(found) : null;
  }

  async getFinishedStock(companyId: string, productId: string): Promise<number> {
    return this.finishedStock.get(key(companyId, productId)) ?? 0;
  }

  async getMaterialStock(companyId: string, materialId: string): Promise<number> {
    return this.materialStock.get(key(companyId, materialId)) ?? 0;
  }

  async findReviewByIdempotency(
    companyId: string,
    idempotencyKey: string,
  ): Promise<ProductionReview | null> {
    const found = this.reviews.find(
      (review) =>
        review.companyId === companyId && review.idempotencyKey === idempotencyKey,
    );
    return found ? structuredClone(found) : null;
  }

  async commitReview(input: ReviewCommit): Promise<ProductionReview> {
    const existing = await this.findReviewByIdempotency(
      input.review.companyId,
      input.review.idempotencyKey,
    );
    if (existing) return existing;

    const recordSet = new Set(input.recordIds);
    const eligible = this.records.filter(
      (record) =>
        record.companyId === input.review.companyId &&
        recordSet.has(record.id) &&
        record.reviewStatus === "PENDING_REVIEW",
    );
    if (eligible.length !== input.recordIds.length) {
      throw new Error("review contains records that are no longer eligible");
    }

    this.reviews.push(structuredClone(input.review));

    for (const record of eligible) {
      record.reviewStatus = input.review.status;
    }

    this.finishedStock.set(
      key(input.review.companyId, input.review.productId),
      input.finishedStockAfter,
    );

    for (const [materialId, quantity] of Object.entries(input.materialStockAfter)) {
      this.materialStock.set(key(input.review.companyId, materialId), quantity);
    }

    this.movements.push(...structuredClone(input.movements));
    this.audits.push(...structuredClone(input.auditEvents));

    if (input.needProgress) {
      const need = this.needs.find(
        (candidate) =>
          candidate.companyId === input.review.companyId &&
          candidate.id === input.needProgress?.needId,
      );
      if (need) {
        need.confirmedProgressQuantity = Math.min(
          need.targetQuantity,
          need.confirmedProgressQuantity + input.needProgress.confirmedDelta,
        );
        need.status =
          need.confirmedProgressQuantity >= need.targetQuantity
            ? "COMPLETED"
            : "IN_PROGRESS";
      }
    }

    return structuredClone(input.review);
  }

  async listStockMovements(companyId: string): Promise<StockMovement[]> {
    return structuredClone(
      this.movements.filter((movement) => movement.companyId === companyId),
    );
  }

  async listAuditEvents(companyId: string): Promise<AuditEvent[]> {
    return structuredClone(
      this.audits.filter((event) => event.companyId === companyId),
    );
  }
}
