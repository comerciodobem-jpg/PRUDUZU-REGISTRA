import fs from "node:fs/promises";
import { Client } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}
if (process.env.DEMO_MODE !== "true") {
  throw new Error("Refusing to seed demo data unless DEMO_MODE=true.");
}

const sql = await fs.readFile(new URL("../db/demo_seed.sql", import.meta.url), "utf8");
const client = new Client(process.env.DATABASE_URL);
await client.connect();
try {
  await client.query(sql);
  console.log("Demo seed complete.");
} finally {
  await client.end();
}
