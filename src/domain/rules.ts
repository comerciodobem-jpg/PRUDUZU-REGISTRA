import type {
  MaterialConsumptionInput,
  MaterialConsumptionResult,
  PackagingQuantity,
  ProductionNeedCandidate,
} from "./types";

export function calculateDifference(_declared: number, _confirmed: number): number {
  throw new Error("not implemented: calculateDifference");
}

export function convertPackagingToBase(_input: PackagingQuantity): number {
  throw new Error("not implemented: convertPackagingToBase");
}

export function selectUnambiguousNeed(
  _productId: string,
  _needs: ProductionNeedCandidate[],
): ProductionNeedCandidate | null {
  throw new Error("not implemented: selectUnambiguousNeed");
}

export function calculateMaterialConsumption(
  _input: MaterialConsumptionInput,
): MaterialConsumptionResult {
  throw new Error("not implemented: calculateMaterialConsumption");
}
