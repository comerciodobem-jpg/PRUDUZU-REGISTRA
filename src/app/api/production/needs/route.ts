import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

export async function GET() {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const needs = await getProductionService().listNeeds(actor);
    return NextResponse.json({ needs });
  } catch (error) {
    return apiError(error);
  }
}
