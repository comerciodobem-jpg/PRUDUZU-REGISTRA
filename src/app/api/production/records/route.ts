import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

const recordSchema = z.object({
  barcode: z.string().trim().min(1).max(128),
  quantity: z.number().positive(),
  idempotencyKey: z.string().min(8).max(200),
  sourceDeviceId: z.string().max(200).optional(),
  localRecordedAt: z.string().datetime().optional(),
});

export async function GET() {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const records = await getProductionService().listVisibleRecords(actor);
    return NextResponse.json({ records });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const input = recordSchema.parse(await request.json());
    const record = await getProductionService().recordProduction(actor, input);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
