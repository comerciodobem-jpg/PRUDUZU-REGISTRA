import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getProductionService } from "@/server/container";
import { apiError, unauthorized } from "@/server/http";

export async function GET() {
  const actor = await getSession();
  if (!actor) return unauthorized();

  try {
    const groups = await getProductionService().listPendingReviewGroups(actor);
    return NextResponse.json({ groups });
  } catch (error) {
    return apiError(error);
  }
}
