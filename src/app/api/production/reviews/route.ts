import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

const schema = z.object({
  productId: z.string().min(1).max(200),
  confirmedQuantity: z.number().positive(),
  idempotencyKey: z.string().min(8).max(200),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const input = schema.parse(await request.json());
    const review = await getProductionService().reviewProduction(actor, input);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
