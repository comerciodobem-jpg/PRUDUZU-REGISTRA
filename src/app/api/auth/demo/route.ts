import { NextResponse } from "next/server";
import { z } from "zod";
import { createDemoSession, demoModeEnabled } from "@/server/auth/session";
import { apiError } from "@/server/http";

const schema = z.object({
  role: z.enum(["operator", "reviewer"]),
});

export async function POST(request: Request) {
  try {
    if (!demoModeEnabled()) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Rota indisponível." },
        { status: 404 },
      );
    }
    const body = schema.parse(await request.json());
    const actor = await createDemoSession(body.role);
    return NextResponse.json({ actor });
  } catch (error) {
    return apiError(error);
  }
}
