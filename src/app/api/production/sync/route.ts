import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { unauthorized } from "@/server/http";
import { ProductionServiceError } from "@/server/services/production-service";

const itemSchema = z.object({
  localId: z.string().min(1).max(200),
  barcode: z.string().trim().min(1).max(128),
  quantity: z.number().positive(),
  idempotencyKey: z.string().min(8).max(200),
  sourceDeviceId: z.string().max(200).optional(),
  localRecordedAt: z.string().datetime().optional(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1).max(100),
});

export async function POST(request: Request) {
  const actor = await getSession();
  if (!actor) return unauthorized();

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const service = getProductionService();
  const results = [];

  for (const item of parsed.data.items) {
    try {
      const record = await service.recordProduction(actor, item);
      results.push({
        localId: item.localId,
        ok: true,
        serverId: record.id,
        reviewStatus: record.reviewStatus,
      });
    } catch (error) {
      if (error instanceof ProductionServiceError) {
        results.push({
          localId: item.localId,
          ok: false,
          error: error.code,
          message: error.message,
        });
      } else {
        results.push({
          localId: item.localId,
          ok: false,
          error: "INTERNAL_ERROR",
          message: "Falha temporária de sincronização.",
        });
      }
    }
  }

  const allOk = results.every((result) => result.ok);
  return NextResponse.json({ results }, { status: allOk ? 200 : 207 });
}
