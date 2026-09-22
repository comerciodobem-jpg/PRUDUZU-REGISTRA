import { describe, expect, it } from "vitest";
import type { RepositorySeed } from "../../src/server/repositories/contracts";
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
const otherOperator: SessionActor = {
  ...operator,
  userId: "user-other",
  employeeId: "employee-other",
  name: "Outra pessoa",
};
const reviewer: SessionActor = {
  companyId: "company-a",
  userId: "user-reviewer",
  employeeId: "employee-reviewer",
  name: "Conferente",
  permissions: ["production.record", "production.read.team", "production.review", "production.need.read"],
};

function fixture(seed: RepositorySeed = structuredClone(demoSeed)) {
  const repository = new MemoryProductionRepository(seed);
  return { repository, service: new ProductionService(repository) };
}

describe("production read models", () => {
  it("shows only the operator's records without team permission", async () => {
    const { service } = fixture();
    await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 10,
      idempotencyKey: "operator-one",
    });
    await service.recordProduction(otherOperator, {
      barcode: "7891000000001",
      quantity: 20,
      idempotencyKey: "operator-two",
    });

    const own = await service.listVisibleRecords(operator);
    expect(own).toHaveLength(1);
    expect(own[0].declaredQuantity).toBe(10);

    const team = await service.listVisibleRecords(reviewer);
    expect(team).toHaveLength(2);
  });

  it("returns active needs with remaining quantity and never invents a target", async () => {
    const { service } = fixture();
    const needs = await service.listNeeds(operator);

    expect(needs).toHaveLength(1);
    expect(needs[0]).toMatchObject({
      id: "need-colorau",
      targetQuantity: 4500,
      confirmedProgressQuantity: 0,
      remainingQuantity: 4500,
      priority: "URGENT",
    });
  });

  it("groups pending review by product and preserves worker composition", async () => {
    const { service } = fixture();
    await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 30,
      idempotencyKey: "group-one",
    });
    await service.recordProduction(otherOperator, {
      barcode: "7891000000001",
      quantity: 40,
      idempotencyKey: "group-two",
    });

    const groups = await service.listPendingReviewGroups(reviewer);
    expect(groups).toHaveLength(1);
    expect(groups[0].declaredTotal).toBe(70);
    expect(groups[0].contributors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ employeeId: "employee-operator", name: "Operador", quantity: 30 }),
        expect.objectContaining({ employeeId: "employee-other", name: "Outra pessoa", quantity: 40 }),
      ]),
    );
  });

  it("rejects the review read model when permission is missing", async () => {
    const { service } = fixture();
    await expect(service.listPendingReviewGroups(operator)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("leaves the need link empty when two active needs match and audits ambiguity", async () => {
    const seed = structuredClone(demoSeed);
    seed.needs.push({
      ...seed.needs[0],
      id: "need-colorau-second",
      priority: "NORMAL",
    });

    const { repository, service } = fixture(seed);
    const record = await service.recordProduction(operator, {
      barcode: "7891000000001",
      quantity: 10,
      idempotencyKey: "ambiguous-need",
    });

    expect(record.productionNeedId).toBeUndefined();
    expect(
      (await repository.listAuditEvents("company-a")).some(
        (event) => event.action === "production.need.ambiguous",
      ),
    ).toBe(true);
  });
});
