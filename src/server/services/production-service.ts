import type { SessionActor } from "../../domain/types";
import type { ProductionRepository } from "../repositories/contracts";

export interface RecordProductionInput {
  barcode: string;
  quantity: number;
  idempotencyKey: string;
  sourceDeviceId?: string;
  localRecordedAt?: string;
}

export interface ReviewProductionInput {
  productId: string;
  confirmedQuantity: number;
  idempotencyKey: string;
  notes?: string;
}

export class ProductionService {
  constructor(
    private readonly _repository: ProductionRepository,
    private readonly _options: { allowSelfReview: boolean } = { allowSelfReview: false },
  ) {}

  async recordProduction(_actor: SessionActor, _input: RecordProductionInput): Promise<never> {
    throw new Error("not implemented: recordProduction");
  }

  async reviewProduction(_actor: SessionActor, _input: ReviewProductionInput): Promise<never> {
    throw new Error("not implemented: reviewProduction");
  }
}
