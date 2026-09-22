import type { ProductionRepository } from "./repositories/contracts";
import { MemoryProductionRepository } from "./repositories/memory";
import { PostgresProductionRepository } from "./repositories/postgres";
import { demoSeed } from "./demo/seed";
import { ProductionService } from "./services/production-service";

type GlobalRepositories = typeof globalThis & {
  __produzirMemoryRepository?: MemoryProductionRepository;
  __produzirPostgresRepository?: PostgresProductionRepository;
};

function memoryRepository(): MemoryProductionRepository {
  const globalStore = globalThis as GlobalRepositories;
  if (!globalStore.__produzirMemoryRepository) {
    globalStore.__produzirMemoryRepository = new MemoryProductionRepository(
      structuredClone(demoSeed),
    );
  }
  return globalStore.__produzirMemoryRepository;
}

export function getProductionRepository(): ProductionRepository {
  if (process.env.DATABASE_URL) {
    const globalStore = globalThis as GlobalRepositories;
    if (!globalStore.__produzirPostgresRepository) {
      globalStore.__produzirPostgresRepository =
        new PostgresProductionRepository();
    }
    return globalStore.__produzirPostgresRepository;
  }

  if (
    process.env.DEMO_MODE === "true" ||
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    return memoryRepository();
  }

  throw new Error(
    "Storage not configured. Set DATABASE_URL or enable DEMO_MODE for preview.",
  );
}

export function getProductionService(): ProductionService {
  return new ProductionService(getProductionRepository(), {
    allowSelfReview: process.env.ALLOW_SELF_REVIEW === "true",
  });
}
