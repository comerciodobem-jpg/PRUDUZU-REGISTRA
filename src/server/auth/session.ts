import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionActor } from "../../domain/types";

const COOKIE_NAME = "produzir_registra_session";
const SESSION_HOURS = 12;

export const demoActors = {
  operator: {
    companyId: "company-a",
    userId: "demo-operator",
    employeeId: "employee-demo-operator",
    name: "Ana Produção",
    permissions: [
      "production.record",
      "production.read.self",
      "production.need.read",
    ],
  },
  reviewer: {
    companyId: "company-a",
    userId: "demo-reviewer",
    employeeId: "employee-demo-reviewer",
    name: "Carlos Conferência",
    permissions: [
      "production.record",
      "production.read.team",
      "production.review",
      "production.need.read",
    ],
  },
} satisfies Record<string, SessionActor>;

type DemoRole = keyof typeof demoActors;
type SessionPayload = SessionActor & { expiresAt: number };

function authSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") {
    return "development-only-produzir-registra-secret";
  }
  throw new Error("AUTH_SECRET is required in production.");
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", authSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function encode(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${data}.${sign(data)}`;
}

function decode(token: string): SessionPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = Buffer.from(sign(data));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function demoModeEnabled(): boolean {
  return process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development";
}

export async function getSession(): Promise<SessionActor | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = decode(token);
  if (!payload) return null;

  const { expiresAt: _expiresAt, ...actor } = payload;
  return actor;
}

export async function createDemoSession(role: DemoRole): Promise<SessionActor> {
  if (!demoModeEnabled()) {
    throw new Error("Demo authentication is disabled.");
  }

  const actor = demoActors[role];
  if (!actor) throw new Error("Unknown demo role.");

  const store = await cookies();
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  store.set(COOKIE_NAME, encode({ ...actor, expiresAt }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });

  return actor;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
