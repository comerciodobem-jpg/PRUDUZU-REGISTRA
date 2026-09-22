import { randomUUID } from "node:crypto";
import type {
  AuditEvent,
  Product,
  ProductionNeed,
  ProductionRecord,
  ProductionReview,
  StockMovement,
  TechnicalSheet,
} from "../../domain/types";
import { createTransactionClient, getSql } from "../db/client";
import type {
  ProductionRepository,
  ReviewCommit,
} from "./contracts";

type Row = Record<string, unknown>;

function number(value: unknown): number {
  return Number(value ?? 0);
}

function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function productFromRow(row: Row): Product {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    sku: String(row.sku),
    name: String(row.name),
    presentation: String(row.presentation ?? ""),
    barcode: String(row.barcode),
    controlUnit: String(row.control_unit),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    active: Boolean(row.active),
    packageConversion: json(row.package_conversion, []),
  };
}

function recordFromRow(row: Row): ProductionRecord {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    userId: String(row.user_id),
    employeeId: String(row.employee_id),
    recordedByName: String(row.recorded_by_name),
    productId: String(row.product_id),
    barcode: String(row.barcode),
    declaredQuantity: number(row.declared_quantity),
    unit: String(row.unit),
    recordedAt: new Date(String(row.recorded_at)).toISOString(),
    localRecordedAt: row.local_recorded_at
      ? new Date(String(row.local_recorded_at)).toISOString()
      : undefined,
    syncStatus: row.sync_status as ProductionRecord["syncStatus"],
    reviewStatus: row.review_status as ProductionRecord["reviewStatus"],
    sourceDeviceId: row.source_device_id ? String(row.source_device_id) : undefined,
    productionNeedId: row.production_need_id
      ? String(row.production_need_id)
      : undefined,
    idempotencyKey: String(row.idempotency_key),
  };
}

function reviewFromRow(row: Row): ProductionReview {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    productId: String(row.product_id),
    declaredTotal: number(row.declared_total),
    confirmedQuantity: number(row.confirmed_quantity),
    differenceQuantity: number(row.difference_quantity),
    reviewerUserId: String(row.reviewer_user_id),
    reviewedAt: new Date(String(row.reviewed_at)).toISOString(),
    status: row.status as ProductionReview["status"],
    notes: row.notes ? String(row.notes) : undefined,
    idempotencyKey: String(row.idempotency_key),
  };
}

function needFromRow(row: Row): ProductionNeed {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    productId: String(row.product_id),
    status: row.status as ProductionNeed["status"],
    priority: row.priority as ProductionNeed["priority"],
    targetQuantity: number(row.target_quantity),
    confirmedProgressQuantity: number(row.confirmed_progress_quantity),
    registeredProgressQuantity: number(row.registered_progress_quantity),
    dueAt: row.due_at ? new Date(String(row.due_at)).toISOString() : undefined,
    note: row.note ? String(row.note) : undefined,
  };
}

function movementFromRow(row: Row): StockMovement {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    itemId: String(row.item_id),
    type: row.type as StockMovement["type"],
    quantity: number(row.quantity),
    referenceId: String(row.reference_id),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function auditFromRow(row: Row): AuditEvent {
  return {
    id: String(row.id),
    companyId: String(row.company_id),
    actorUserId: String(row.actor_user_id),
    action: String(row.action),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    before: row.before_data ?? undefined,
    after: row.after_data ?? undefined,
    reason: row.reason ? String(row.reason) : undefined,
    timestamp: new Date(String(row.created_at)).toISOString(),
  };
}

async function insertAudit(
  client: ReturnType<typeof createTransactionClient>,
  event: AuditEvent,
): Promise<void> {
  await client.query(
    `INSERT INTO audit_events
      (id, company_id, actor_user_id, action, entity_type, entity_id, before_data, after_data, reason, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10)`,
    [
      event.id,
      event.companyId,
      event.actorUserId,
      event.action,
      event.entityType,
      event.entityId,
      JSON.stringify(event.before ?? null),
      JSON.stringify(event.after ?? null),
      event.reason ?? null,
      event.timestamp,
    ],
  );
}

export class PostgresProductionRepository implements ProductionRepository {
  async findProductByBarcode(companyId: string, barcode: string): Promise<Product | null> {
    const rows = (await getSql()`
      SELECT * FROM products
      WHERE company_id = ${companyId} AND barcode = ${barcode}
      LIMIT 1
    `) as unknown as Row[];
    return rows[0] ? productFromRow(rows[0]) : null;
  }

  async findProductById(companyId: string, productId: string): Promise<Product | null> {
    const rows = (await getSql()`
      SELECT * FROM products
      WHERE company_id = ${companyId} AND id = ${productId}
      LIMIT 1
    `) as unknown as Row[];
    return rows[0] ? productFromRow(rows[0]) : null;
  }

  async listProducts(companyId: string): Promise<Product[]> {
    const rows = (await getSql()`
      SELECT * FROM products
      WHERE company_id = ${companyId} AND active=true
      ORDER BY name, presentation
    `) as unknown as Row[];
    return rows.map(productFromRow);
  }

  async findRecordByIdempotency(
    companyId: string,
    idempotencyKey: string,
  ): Promise<ProductionRecord | null> {
    const rows = (await getSql()`
      SELECT * FROM production_records
      WHERE company_id = ${companyId} AND idempotency_key = ${idempotencyKey}
      LIMIT 1
    `) as unknown as Row[];
    return rows[0] ? recordFromRow(rows[0]) : null;
  }

  async createRecord(
    record: ProductionRecord,
    auditEvents: AuditEvent[],
  ): Promise<ProductionRecord> {
    const client = createTransactionClient();
    await client.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO production_records
          (id, company_id, user_id, employee_id, recorded_by_name, product_id, barcode,
           declared_quantity, unit, recorded_at, local_recorded_at, sync_status, review_status,
           source_device_id, production_need_id, idempotency_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (company_id, idempotency_key) DO NOTHING
         RETURNING *`,
        [
          record.id,
          record.companyId,
          record.userId,
          record.employeeId,
          record.recordedByName,
          record.productId,
          record.barcode,
          record.declaredQuantity,
          record.unit,
          record.recordedAt,
          record.localRecordedAt ?? null,
          record.syncStatus,
          record.reviewStatus,
          record.sourceDeviceId ?? null,
          record.productionNeedId ?? null,
          record.idempotencyKey,
        ],
      );

      if (inserted.rows.length === 0) {
        const existing = await client.query(
          "SELECT * FROM production_records WHERE company_id=$1 AND idempotency_key=$2 LIMIT 1",
          [record.companyId, record.idempotencyKey],
        );
        await client.query("COMMIT");
        return recordFromRow(existing.rows[0] as Row);
      }

      if (record.productionNeedId) {
        await client.query(
          `UPDATE production_needs
           SET registered_progress_quantity = registered_progress_quantity + $1,
               status = CASE WHEN status='OPEN' THEN 'IN_PROGRESS' ELSE status END
           WHERE company_id=$2 AND id=$3 AND status IN ('OPEN','IN_PROGRESS')`,
          [record.declaredQuantity, record.companyId, record.productionNeedId],
        );
      }

      for (const event of auditEvents) {
        await insertAudit(client, event);
      }

      await client.query("COMMIT");
      return recordFromRow(inserted.rows[0] as Row);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }
  }

  async listRecords(companyId: string): Promise<ProductionRecord[]> {
    const rows = (await getSql()`
      SELECT * FROM production_records
      WHERE company_id = ${companyId}
      ORDER BY recorded_at DESC
    `) as unknown as Row[];
    return rows.map(recordFromRow);
  }

  async listActiveNeeds(companyId: string, productId?: string): Promise<ProductionNeed[]> {
    const rows = productId
      ? ((await getSql()`
          SELECT * FROM production_needs
          WHERE company_id=${companyId}
            AND product_id=${productId}
            AND status IN ('OPEN','IN_PROGRESS')
          ORDER BY created_at, id
        `) as unknown as Row[])
      : ((await getSql()`
          SELECT * FROM production_needs
          WHERE company_id=${companyId}
            AND status IN ('OPEN','IN_PROGRESS')
          ORDER BY
            CASE priority WHEN 'URGENT' THEN 1 WHEN 'ATTENTION' THEN 2 ELSE 3 END,
            created_at, id
        `) as unknown as Row[]);
    return rows.map(needFromRow);
  }

  async getTechnicalSheet(
    companyId: string,
    productId: string,
  ): Promise<TechnicalSheet | null> {
    const sheets = (await getSql()`
      SELECT * FROM technical_sheets
      WHERE company_id=${companyId} AND product_id=${productId} AND active=true
      ORDER BY created_at DESC LIMIT 1
    `) as unknown as Row[];
    const sheet = sheets[0];
    if (!sheet) return null;

    const items = (await getSql()`
      SELECT * FROM technical_sheet_items
      WHERE company_id=${companyId} AND technical_sheet_id=${String(sheet.id)}
      ORDER BY material_name
    `) as unknown as Row[];

    return {
      id: String(sheet.id),
      companyId: String(sheet.company_id),
      productId: String(sheet.product_id),
      version: String(sheet.version),
      items: items.map((item) => ({
        materialId: String(item.material_id),
        materialName: String(item.material_name),
        quantityPerBase: number(item.quantity_per_base),
        unit: String(item.unit),
      })),
    };
  }

  async getFinishedStock(companyId: string, productId: string): Promise<number> {
    const rows = (await getSql()`
      SELECT quantity FROM stock_balances
      WHERE company_id=${companyId} AND item_id=${productId} AND item_kind='FINISHED'
      LIMIT 1
    `) as unknown as Row[];
    return number(rows[0]?.quantity);
  }

  async getMaterialStock(companyId: string, materialId: string): Promise<number> {
    const rows = (await getSql()`
      SELECT quantity FROM stock_balances
      WHERE company_id=${companyId} AND item_id=${materialId} AND item_kind='MATERIAL'
      LIMIT 1
    `) as unknown as Row[];
    return number(rows[0]?.quantity);
  }

  async findReviewByIdempotency(
    companyId: string,
    idempotencyKey: string,
  ): Promise<ProductionReview | null> {
    const rows = (await getSql()`
      SELECT * FROM production_reviews
      WHERE company_id=${companyId} AND idempotency_key=${idempotencyKey}
      LIMIT 1
    `) as unknown as Row[];
    return rows[0] ? reviewFromRow(rows[0]) : null;
  }

  async commitReview(input: ReviewCommit): Promise<ProductionReview> {
    const client = createTransactionClient();
    await client.connect();

    try {
      await client.query("BEGIN");

      const duplicate = await client.query(
        "SELECT * FROM production_reviews WHERE company_id=$1 AND idempotency_key=$2 LIMIT 1",
        [input.review.companyId, input.review.idempotencyKey],
      );
      if (duplicate.rows[0]) {
        await client.query("COMMIT");
        return reviewFromRow(duplicate.rows[0] as Row);
      }

      const lockedRecords = await client.query(
        `SELECT id, declared_quantity
         FROM production_records
         WHERE company_id=$1 AND id=ANY($2::text[]) AND review_status='PENDING_REVIEW'
         FOR UPDATE`,
        [input.review.companyId, input.recordIds],
      );
      if (lockedRecords.rows.length !== input.recordIds.length) {
        throw new Error("review contains records that are no longer eligible");
      }

      const insertedReview = await client.query(
        `INSERT INTO production_reviews
          (id, company_id, product_id, declared_total, confirmed_quantity, difference_quantity,
           reviewer_user_id, reviewed_at, status, notes, idempotency_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [
          input.review.id,
          input.review.companyId,
          input.review.productId,
          input.review.declaredTotal,
          input.review.confirmedQuantity,
          input.review.differenceQuantity,
          input.review.reviewerUserId,
          input.review.reviewedAt,
          input.review.status,
          input.review.notes ?? null,
          input.review.idempotencyKey,
        ],
      );

      for (const row of lockedRecords.rows as Row[]) {
        await client.query(
          `INSERT INTO production_review_items
             (review_id, production_record_id, declared_quantity, included_quantity)
           VALUES ($1,$2,$3,$3)`,
          [input.review.id, String(row.id), number(row.declared_quantity)],
        );
      }

      await client.query(
        `UPDATE production_records
         SET review_status=$1
         WHERE company_id=$2 AND id=ANY($3::text[])`,
        [input.review.status, input.review.companyId, input.recordIds],
      );

      await client.query(
        `INSERT INTO stock_balances (company_id,item_id,item_kind,quantity,updated_at)
         VALUES ($1,$2,'FINISHED',0,now())
         ON CONFLICT (company_id,item_id,item_kind) DO NOTHING`,
        [input.review.companyId, input.review.productId],
      );
      const finished = await client.query(
        `SELECT quantity FROM stock_balances
         WHERE company_id=$1 AND item_id=$2 AND item_kind='FINISHED'
         FOR UPDATE`,
        [input.review.companyId, input.review.productId],
      );
      const finishedAfter =
        number((finished.rows[0] as Row | undefined)?.quantity) +
        input.review.confirmedQuantity;
      await client.query(
        `UPDATE stock_balances SET quantity=$1, updated_at=now()
         WHERE company_id=$2 AND item_id=$3 AND item_kind='FINISHED'`,
        [finishedAfter, input.review.companyId, input.review.productId],
      );

      const finishedMovement =
        input.movements.find((movement) => movement.type === "FINISHED_GOODS_IN") ?? {
          id: randomUUID(),
          companyId: input.review.companyId,
          itemId: input.review.productId,
          type: "FINISHED_GOODS_IN" as const,
          quantity: input.review.confirmedQuantity,
          referenceId: input.review.id,
          createdAt: input.review.reviewedAt,
        };
      await client.query(
        `INSERT INTO stock_movements
          (id,company_id,item_id,type,quantity,reference_id,created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          finishedMovement.id,
          finishedMovement.companyId,
          finishedMovement.itemId,
          finishedMovement.type,
          input.review.confirmedQuantity,
          finishedMovement.referenceId,
          finishedMovement.createdAt,
        ],
      );

      const shortageAuditIds = new Set(
        input.auditEvents
          .filter((event) => event.action === "stock.material_shortage_detected")
          .map((event) => event.entityId),
      );

      for (const materialId of Object.keys(input.materialStockAfter)) {
        const materialMovements = input.movements.filter(
          (movement) =>
            movement.itemId === materialId &&
            (movement.type === "MATERIAL_CONSUMED" ||
              movement.type === "MATERIAL_SHORTAGE"),
        );
        const required = materialMovements.reduce(
          (sum, movement) => sum + movement.quantity,
          0,
        );

        await client.query(
          `INSERT INTO stock_balances (company_id,item_id,item_kind,quantity,updated_at)
           VALUES ($1,$2,'MATERIAL',0,now())
           ON CONFLICT (company_id,item_id,item_kind) DO NOTHING`,
          [input.review.companyId, materialId],
        );
        const balance = await client.query(
          `SELECT quantity FROM stock_balances
           WHERE company_id=$1 AND item_id=$2 AND item_kind='MATERIAL'
           FOR UPDATE`,
          [input.review.companyId, materialId],
        );
        const available = number((balance.rows[0] as Row | undefined)?.quantity);
        const consumed = Math.min(required, available);
        const shortage = Math.max(0, required - available);
        const remaining = Math.max(0, available - consumed);

        await client.query(
          `UPDATE stock_balances SET quantity=$1, updated_at=now()
           WHERE company_id=$2 AND item_id=$3 AND item_kind='MATERIAL'`,
          [remaining, input.review.companyId, materialId],
        );

        if (consumed > 0) {
          const original = materialMovements.find(
            (movement) => movement.type === "MATERIAL_CONSUMED",
          );
          await client.query(
            `INSERT INTO stock_movements
              (id,company_id,item_id,type,quantity,reference_id,created_at)
             VALUES ($1,$2,$3,'MATERIAL_CONSUMED',$4,$5,$6)`,
            [
              original?.id ?? randomUUID(),
              input.review.companyId,
              materialId,
              consumed,
              input.review.id,
              input.review.reviewedAt,
            ],
          );
        }

        if (shortage > 0) {
          const original = materialMovements.find(
            (movement) => movement.type === "MATERIAL_SHORTAGE",
          );
          await client.query(
            `INSERT INTO stock_movements
              (id,company_id,item_id,type,quantity,reference_id,created_at)
             VALUES ($1,$2,$3,'MATERIAL_SHORTAGE',$4,$5,$6)`,
            [
              original?.id ?? randomUUID(),
              input.review.companyId,
              materialId,
              shortage,
              input.review.id,
              input.review.reviewedAt,
            ],
          );

          if (!shortageAuditIds.has(materialId)) {
            await insertAudit(client, {
              id: randomUUID(),
              companyId: input.review.companyId,
              actorUserId: input.actor.userId,
              action: "stock.material_shortage_detected",
              entityType: "Material",
              entityId: materialId,
              before: { availableQuantity: available },
              after: {
                requiredQuantity: required,
                consumedQuantity: consumed,
                shortageQuantity: shortage,
              },
              reason: "Saldo concorrente insuficiente durante a confirmação.",
              timestamp: input.review.reviewedAt,
            });
          }
        }
      }

      for (const event of input.auditEvents) {
        await insertAudit(client, event);
      }

      if (input.needProgress) {
        await client.query(
          `UPDATE production_needs
           SET confirmed_progress_quantity = LEAST(
                 target_quantity,
                 confirmed_progress_quantity + $1
               ),
               status = CASE
                 WHEN confirmed_progress_quantity + $1 >= target_quantity
                   THEN 'COMPLETED'
                 ELSE 'IN_PROGRESS'
               END,
               completed_at = CASE
                 WHEN confirmed_progress_quantity + $1 >= target_quantity
                   THEN COALESCE(completed_at, now())
                 ELSE completed_at
               END
           WHERE company_id=$2 AND id=$3 AND status IN ('OPEN','IN_PROGRESS')`,
          [
            input.needProgress.confirmedDelta,
            input.review.companyId,
            input.needProgress.needId,
          ],
        );
      }

      await client.query("COMMIT");
      return reviewFromRow(insertedReview.rows[0] as Row);
    } catch (error) {
      await client.query("ROLLBACK");
      if ((error as { code?: string }).code === "23505") {
        const existing = await this.findReviewByIdempotency(
          input.review.companyId,
          input.review.idempotencyKey,
        );
        if (existing) return existing;
      }
      throw error;
    } finally {
      await client.end();
    }
  }

  async listStockMovements(companyId: string): Promise<StockMovement[]> {
    const rows = (await getSql()`
      SELECT * FROM stock_movements
      WHERE company_id=${companyId}
      ORDER BY created_at DESC
    `) as unknown as Row[];
    return rows.map(movementFromRow);
  }

  async listAuditEvents(companyId: string): Promise<AuditEvent[]> {
    const rows = (await getSql()`
      SELECT * FROM audit_events
      WHERE company_id=${companyId}
      ORDER BY created_at DESC
    `) as unknown as Row[];
    return rows.map(auditFromRow);
  }
}
