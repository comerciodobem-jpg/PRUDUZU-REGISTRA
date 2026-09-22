import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/server/auth/session";

export async function GET() {
  const actor = await getSession();
  return NextResponse.json({ actor });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
