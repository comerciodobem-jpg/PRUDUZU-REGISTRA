import { describe, expect, it } from "vitest";
import type { SessionActor } from "../../src/domain/types";
import { demoSeed } from "../../src/server/demo/seed";
import { MemoryProductionRepository } from "../../src/server/repositories/memory";
import { ProductionService } from "../../src/server/services/production-service";

const operator: SessionActor = {
  companyId: "company-a",
  userId: "user-operator",
  employeeId: "employee-operator",
  name: "Operador",
  permissions: ["production.record", "production.read.self", "production.need.read"],
};

const reviewer: SessionActor = {
  companyId: "company-a",
  userId: "user-reviewer",
  employeeId: "employee-reviewer",
  name: "Conferente",
  permissions: ["production.record", "production.read.team", "production.review", "production.need.read"],
};

function createFixture() {
  const repository = new MemoryProductionRepository(structuredClone(demoSeed));
  const service = new ProductionService(repository, { allowSelfReview: false });
  return { repository, service };
}

describe("ProductionService", () => {
  it("records under the authenticated identity without moving finished stock", async () => {
    const { repository, service } = createFixture();

    const record = await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 100,
      idempotencyKey: "record-1",
    });

    expect(record.userId).toBe(operator.userId);
    expect(record.companyId).toBe(operator.companyId);
    expect(record.reviewStatus).toBe("PENDING_REVIEW");
    expect(record.productionNeedId).toBe("need-colorau");
    expect(await repository.getFinishedStock("company-a", "p-colorau")).toBe(0);
    expect(await repository.listStockMovements("company-a")).toHaveLength(0);
  });

  it("replays the same record idempotency key without duplication", async () => {
    const { repository, service } = createFixture();
    const input = {
      barcode: "7891000000001",
      quantity: 100,
      idempotencyKey: "same-record-key",
    };

    const first = await service.recordProduction(operator, input);
    const second = await service.recordProduction(operator, input);

    expect(second.id).toBe(first.id);
    expect(await repository.listRecords("company-a")).toHaveLength(1);
  });

  it("does not expose another company's product through a barcode", async () => {
    const { service } = createFixture();
    const actor = { ...operator, companyId: "company-b", userId: "user-b" };

    await expect(
      service.recordProduction(actor, {
        barcode: "7891000000001",
        quantity: 10,
        idempotencyKey: "company-isolation",
      }),
    ).rejects.toMatchObject({ code: "PRODUCT_NOT_FOUND" });
  });

  it("moves only the confirmed quantity, clamps material at zero and preserves divergence", async () => {
    const { repository, service } = createFixture();

    const record = await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 100,
      idempotencyKey: "record-review",
    });

    const review = await service.reviewProduction(reviewer, {
      productId: "p-colorau",
      confirmedQuantity: 90,
      idempotencyKey: "review-1",
    });

    expect(review.declaredTotal).toBe(100);
    expect(review.confirmedQuantity).toBe(90);
    expect(review.differenceQuantity).toBe(-10);
    expect(review.status).toBe("DIVERGENT");

    const [storedRecord] = await repository.listRecords("company-a");
    expect(storedRecord.id).toBe(record.id);
    expect(storedRecord.declaredQuantity).toBe(100);
    expect(storedRecord.reviewStatus).toBe("DIVERGENT");

    expect(await repository.getFinishedStock("company-a", "p-colorau")).toBe(90);
    expect(await repository.getMaterialStock("company-a", "m-colorau")).toBe(0);

    const movements = await repository.listStockMovements("company-a");
    expect(movements.filter((movement) => movement.type === "FINISHED_GOODS_IN")).toHaveLength(1);
    expect(movements.find((movement) => movement.type === "MATERIAL_SHORTAGE")?.quantity).toBe(0.3);

    const audit = await repository.listAuditEvents("company-a");
    expect(audit.some((event) => event.action === "production.reviewed")).toBe(true);
    expect(audit.some((event) => event.action === "stock.material_shortage_detected")).toBe(true);
  });

  it("replays the same review idempotency key without moving stock twice", async () => {
    const { repository, service } = createFixture();

    await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 50,
      idempotencyKey: "record-once",
    });

    const input = {
      productId: "p-colorau",
      confirmedQuantity: 50,
      idempotencyKey: "review-once",
    };

    const first = await service.reviewProduction(reviewer, input);
    const second = await service.reviewProduction(reviewer, input);

    expect(second.id).toBe(first.id);
    expect(await repository.getFinishedStock("company-a", "p-colorau")).toBe(50);
    expect(
      (await repository.listStockMovements("company-a")).filter(
        (movement) => movement.type === "FINISHED_GOODS_IN",
      ),
    ).toHaveLength(1);
  });

  it("blocks self-review by default", async () => {
    const { service } = createFixture();
    const managerOperator: SessionActor = {
      ...reviewer,
      userId: "same-user",
      employeeId: "same-employee",
    };

    await service.recordProduction(managerOperator, {
      barcode: "7891000000001",
      quantity: 20,
      idempotencyKey: "self-record",
    });

    await expect(
      service.reviewProduction(managerOperator, {
        productId: "p-colorau",
        confirmedQuantity: 20,
        idempotencyKey: "self-review",
      }),
    ).rejects.toMatchObject({ code: "SELF_REVIEW_BLOCKED" });
  });
});
