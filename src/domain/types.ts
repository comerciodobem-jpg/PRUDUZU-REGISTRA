export type ProductionNeedStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ProductionNeedPriority = "NORMAL" | "ATTENTION" | "URGENT";
export type ReviewStatus = "PENDING_REVIEW" | "CONFIRMED" | "DIVERGENT" | "CORRECTED";
export type SyncStatus = "LOCAL_PENDING" | "SYNCED" | "SYNC_FAILED";

export interface SessionActor {
  companyId: string;
  userId: string;
  employeeId: string;
  name: string;
  permissions: string[];
}

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  presentation: string;
  barcode: string;
  controlUnit: string;
  imageUrl?: string;
  active: boolean;
  packageConversion?: { name: string; multiplier: number }[];
}

export interface ProductionNeedCandidate {
  id: string;
  companyId: string;
  productId: string;
  status: ProductionNeedStatus;
  priority: ProductionNeedPriority;
}

export interface ProductionNeed extends ProductionNeedCandidate {
  targetQuantity: number;
  confirmedProgressQuantity: number;
  registeredProgressQuantity: number;
  dueAt?: string;
  note?: string;
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

export interface TechnicalSheetItem {
  materialId: string;
  materialName: string;
  quantityPerBase: number;
  unit: string;
}

export interface TechnicalSheet {
  id: string;
  companyId: string;
  productId: string;
  version: string;
  items: TechnicalSheetItem[];
}

export interface ProductionRecord {
  id: string;
  companyId: string;
  userId: string;
  employeeId: string;
  recordedByName: string;
  productId: string;
  barcode: string;
  declaredQuantity: number;
  unit: string;
  recordedAt: string;
  localRecordedAt?: string;
  syncStatus: SyncStatus;
  reviewStatus: ReviewStatus;
  sourceDeviceId?: string;
  productionNeedId?: string;
  idempotencyKey: string;
}

export interface ProductionReview {
  id: string;
  companyId: string;
  productId: string;
  declaredTotal: number;
  confirmedQuantity: number;
  differenceQuantity: number;
  reviewerUserId: string;
  reviewedAt: string;
  status: "CONFIRMED" | "DIVERGENT";
  notes?: string;
  idempotencyKey: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  itemId: string;
  type: "FINISHED_GOODS_IN" | "MATERIAL_CONSUMED" | "MATERIAL_SHORTAGE";
  quantity: number;
  referenceId: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  companyId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  timestamp: string;
}
