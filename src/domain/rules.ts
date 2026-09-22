import type {
  MaterialConsumptionInput,
  MaterialConsumptionResult,
  PackagingQuantity,
  ProductionNeedCandidate,
} from "./types";

const QTY_PRECISION = 6;

function roundQuantity(value: number): number {
  return Number(value.toFixed(QTY_PRECISION));
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be finite and non-negative`);
  }
}

export function calculateDifference(declared: number, confirmed: number): number {
  assertFiniteNonNegative(declared, "declared quantity");
  assertFiniteNonNegative(confirmed, "confirmed quantity");
  return roundQuantity(confirmed - declared);
}

export function convertPackagingToBase(input: PackagingQuantity): number {
  assertFiniteNonNegative(input.baseQuantity, "base quantity");

  let total = input.baseQuantity;

  for (const entry of input.packages) {
    assertFiniteNonNegative(entry.count, "package count");

    if (!Number.isFinite(entry.multiplier) || entry.multiplier <= 0) {
      throw new RangeError("package must have a positive multiplier");
    }

    total += entry.count * entry.multiplier;
  }

  return roundQuantity(total);
}

export function selectUnambiguousNeed(
  productId: string,
  needs: ProductionNeedCandidate[],
): ProductionNeedCandidate | null {
  const eligible = needs.filter(
    (need) =>
      need.productId === productId &&
      (need.status === "OPEN" || need.status === "IN_PROGRESS"),
  );

  return eligible.length === 1 ? eligible[0] : null;
}

export function calculateMaterialConsumption(
  input: MaterialConsumptionInput,
): MaterialConsumptionResult {
  assertFiniteNonNegative(input.confirmedQuantity, "confirmed quantity");
  assertFiniteNonNegative(input.quantityPerBase, "quantity per base");
  assertFiniteNonNegative(input.availableQuantity, "available quantity");

  const requiredQuantity = roundQuantity(
    input.confirmedQuantity * input.quantityPerBase,
  );
  const consumedQuantity = roundQuantity(
    Math.min(requiredQuantity, input.availableQuantity),
  );
  const shortageQuantity = roundQuantity(
    Math.max(0, requiredQuantity - input.availableQuantity),
  );
  const remainingQuantity = roundQuantity(
    Math.max(0, input.availableQuantity - consumedQuantity),
  );

  return {
    requiredQuantity,
    consumedQuantity,
    shortageQuantity,
    remainingQuantity,
  };
}
