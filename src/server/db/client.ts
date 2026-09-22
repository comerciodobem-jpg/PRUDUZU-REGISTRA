import { Client, neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error("DATABASE_URL is required for PostgreSQL storage.");
  }
  return value;
}

export function getSql(): ReturnType<typeof neon> {
  if (!sqlClient) {
    sqlClient = neon(databaseUrl());
  }
  return sqlClient;
}

export function createTransactionClient(): Client {
  return new Client(databaseUrl());
}
