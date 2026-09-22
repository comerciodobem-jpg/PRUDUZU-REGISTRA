import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ barcode: string }> },
) {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const { barcode } = await context.params;
    const product = await getProductionService().lookupProduct(
      actor,
      decodeURIComponent(barcode),
    );
    return NextResponse.json({ product });
  } catch (error) {
    return apiError(error);
  }
}
