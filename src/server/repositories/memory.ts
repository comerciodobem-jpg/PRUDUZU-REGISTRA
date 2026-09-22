import type {
  AuditEvent,
  ProductionNeed,
  ProductionRecord,
  ProductionReview,
  StockMovement,
} from "../../domain/types";
import type {
  ProductionRepository,
  RepositorySeed,
  ReviewCommit,
} from "./contracts";

export class MemoryProductionRepository implements ProductionRepository {
  constructor(_seed: RepositorySeed) {}

  async findProductByBarcode(): Promise<never> { throw new Error("not implemented: memory repository"); }
  async findRecordByIdempotency(): Promise<ProductionRecord | null> { throw new Error("not implemented: memory repository"); }
  async createRecord(): Promise<ProductionRecord> { throw new Error("not implemented: memory repository"); }
  async listRecords(): Promise<ProductionRecord[]> { throw new Error("not implemented: memory repository"); }
  async listActiveNeeds(): Promise<ProductionNeed[]> { throw new Error("not implemented: memory repository"); }
  async getTechnicalSheet(): Promise<never> { throw new Error("not implemented: memory repository"); }
  async getFinishedStock(): Promise<number> { throw new Error("not implemented: memory repository"); }
  async getMaterialStock(): Promise<number> { throw new Error("not implemented: memory repository"); }
  async findReviewByIdempotency(): Promise<ProductionReview | null> { throw new Error("not implemented: memory repository"); }
  async commitReview(_input: ReviewCommit): Promise<ProductionReview> { throw new Error("not implemented: memory repository"); }
  async listStockMovements(): Promise<StockMovement[]> { throw new Error("not implemented: memory repository"); }
  async listAuditEvents(): Promise<AuditEvent[]> { throw new Error("not implemented: memory repository"); }
}
