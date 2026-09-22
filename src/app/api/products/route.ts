import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

export async function GET() {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const products = await getProductionService().listProducts(actor);
    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error);
  }
}
