import { config } from "dotenv";
config();

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

// ============================================================
// LOCAL DATABASE
// ============================================================

if (
  !process.env.PGUSER ||
  !process.env.PGHOST ||
  !process.env.PGDATABASE ||
  !process.env.PGPASSWORD ||
  !process.env.PGPORT
) {
  throw new Error(
    "Local PostgreSQL environment variables are missing."
  );
}

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),

  connectionTimeoutMillis: 10000,
  max: 10,
});

pool.on("error", (error) => {
  console.error(
    "❌ Local PostgreSQL pool error:",
    error.message
  );
});

export const db = drizzle({
  client: pool,
  schema,
});

// ============================================================
// LIVE / SERVER DATABASE
// ============================================================

if (
  !process.env.LIVE_PGUSER ||
  !process.env.LIVE_PGHOST ||
  !process.env.LIVE_PGDATABASE ||
  !process.env.LIVE_PGPASSWORD ||
  !process.env.LIVE_PGPORT
) {
  throw new Error(
    "Live PostgreSQL environment variables are missing."
  );
}

export const livePool = new Pool({
  user: process.env.LIVE_PGUSER,
  host: process.env.LIVE_PGHOST,
  database: process.env.LIVE_PGDATABASE,
  password: process.env.LIVE_PGPASSWORD,
  port: Number(process.env.LIVE_PGPORT),

  connectionTimeoutMillis: 10000,
  max: 5,
});

livePool.on("error", (error) => {
  console.error(
    "❌ Live PostgreSQL pool error:",
    error.message
  );
});

export const liveDb = drizzle({
  client: livePool,
  schema,
});