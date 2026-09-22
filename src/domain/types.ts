export type ProductionNeedStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ProductionNeedPriority = "NORMAL" | "ATTENTION" | "URGENT";

export interface ProductionNeedCandidate {
  id: string;
  companyId: string;
  productId: string;
  status: ProductionNeedStatus;
  priority: ProductionNeedPriority;
}

export interface PackageEntry {
  count: number;
  multiplier: number;
}

export interface PackagingQuantity {
  baseQuantity: number;
  packages: PackageEntry[];
}

export interface MaterialConsumptionInput {
  confirmedQuantity: number;
  quantityPerBase: number;
  availableQuantity: number;
}

export interface MaterialConsumptionResult {
  requiredQuantity: number;
  consumedQuantity: number;
  shortageQuantity: number;
  remainingQuantity: number;
}
