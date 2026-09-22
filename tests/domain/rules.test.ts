import { describe, expect, it } from "vitest";
import {
  calculateDifference,
  calculateMaterialConsumption,
  convertPackagingToBase,
  selectUnambiguousNeed,
} from "../../src/domain/rules";
import type { ProductionNeedCandidate } from "../../src/domain/types";

describe("production domain rules", () => {
  it("keeps divergence as confirmed minus declared", () => {
    expect(calculateDifference(1500, 1490)).toBe(-10);
    expect(calculateDifference(1490, 1500)).toBe(10);
  });

  it("converts packages plus loose units to the base unit", () => {
    expect(
      convertPackagingToBase({
        baseQuantity: 8,
        packages: [{ count: 10, multiplier: 24 }],
      }),
    ).toBe(248);
  });

  it("rejects zero or negative packaging quantities", () => {
    expect(() =>
      convertPackagingToBase({
        baseQuantity: -1,
        packages: [],
      }),
    ).toThrow(/non-negative/i);

    expect(() =>
      convertPackagingToBase({
        baseQuantity: 0,
        packages: [{ count: 1, multiplier: 0 }],
      }),
    ).toThrow(/positive multiplier/i);
  });

  it("auto-links only one eligible active need for the product", () => {
    const needs: ProductionNeedCandidate[] = [
      { id: "n1", companyId: "c1", productId: "p1", status: "OPEN", priority: "NORMAL" },
      { id: "n2", companyId: "c1", productId: "p2", status: "OPEN", priority: "URGENT" },
    ];

    expect(selectUnambiguousNeed("p1", needs)?.id).toBe("n1");
  });

  it("does not silently choose between multiple needs for the same product", () => {
    const needs: ProductionNeedCandidate[] = [
      { id: "n1", companyId: "c1", productId: "p1", status: "OPEN", priority: "NORMAL" },
      { id: "n2", companyId: "c1", productId: "p1", status: "IN_PROGRESS", priority: "URGENT" },
    ];

    expect(selectUnambiguousNeed("p1", needs)).toBeNull();
  });

  it("consumes available material down to zero and exposes the shortage", () => {
    expect(
      calculateMaterialConsumption({
        confirmedQuantity: 100,
        quantityPerBase: 0.02,
        availableQuantity: 1.5,
      }),
    ).toEqual({
      requiredQuantity: 2,
      consumedQuantity: 1.5,
      shortageQuantity: 0.5,
      remainingQuantity: 0,
    });
  });

  it("never reports a negative remaining material balance", () => {
    const result = calculateMaterialConsumption({
      confirmedQuantity: 10,
      quantityPerBase: 0.02,
      availableQuantity: 3,
    });

    expect(result).toEqual({
      requiredQuantity: 0.2,
      consumedQuantity: 0.2,
      shortageQuantity: 0,
      remainingQuantity: 2.8,
    });
  });
});
