import type {
  AuditEvent,
  Product,
  ProductionNeed,
  ProductionRecord,
  ProductionReview,
  SessionActor,
  StockMovement,
  TechnicalSheet,
} from "../../domain/types";

export interface RepositorySeed {
  products: Product[];
  needs: ProductionNeed[];
  technicalSheets: TechnicalSheet[];
  finishedStock: Record<string, number>;
  materialStock: Record<string, number>;
}

export interface ReviewCommit {
  actor: SessionActor;
  review: ProductionReview;
  recordIds: string[];
  finishedStockAfter: number;
  materialStockAfter: Record<string, number>;
  movements: StockMovement[];
  auditEvents: AuditEvent[];
  needProgress?: { needId: string; confirmedDelta: number };
}

export interface ProductionRepository {
  findProductByBarcode(companyId: string, barcode: string): Promise<Product | null>;
  findProductById(companyId: string, productId: string): Promise<Product | null>;
  findRecordByIdempotency(companyId: string, key: string): Promise<ProductionRecord | null>;
  createRecord(record: ProductionRecord, auditEvents: AuditEvent[]): Promise<ProductionRecord>;
  listRecords(companyId: string): Promise<ProductionRecord[]>;
  listActiveNeeds(companyId: string, productId?: string): Promise<ProductionNeed[]>;
  getTechnicalSheet(companyId: string, productId: string): Promise<TechnicalSheet | null>;
  getFinishedStock(companyId: string, productId: string): Promise<number>;
  getMaterialStock(companyId: string, materialId: string): Promise<number>;
  findReviewByIdempotency(companyId: string, key: string): Promise<ProductionReview | null>;
  commitReview(input: ReviewCommit): Promise<ProductionReview>;
  listStockMovements(companyId: string): Promise<StockMovement[]>;
  listAuditEvents(companyId: string): Promise<AuditEvent[]>;
}
