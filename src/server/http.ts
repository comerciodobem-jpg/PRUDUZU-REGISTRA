import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ProductionServiceError } from "./services/production-service";

export function apiError(error: unknown): NextResponse {
  if (error instanceof ProductionServiceError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        issues: error.issues,
      },
      { status: 422 },
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      error: "INTERNAL_ERROR",
      message: "Não foi possível concluir a operação.",
    },
    { status: 500 },
  );
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: "UNAUTHORIZED", message: "Sessão necessária." },
    { status: 401 },
  );
}
