import fs from "node:fs/promises";
import { Client } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const sql = await fs.readFile(new URL("../db/0001_initial.sql", import.meta.url), "utf8");
const client = new Client(process.env.DATABASE_URL);
await client.connect();
try {
  await client.query(sql);
  console.log("Database migration complete.");
} finally {
  await client.end();
}
