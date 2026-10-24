import { config } from "dotenv";
config();

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

// ============================================================
// HELPERS — attach per-client error listeners
// ============================================================

function attachClientErrorListeners(pool: pg.Pool, label: string) {
  // Idle clients in the pool
  pool.on("error", (error, _client) => {
    console.error(`❌ ${label} pool error (idle client):`, error.message);
    // Do NOT throw — pool discards broken client
  });

  // Every checked-out client gets its own listener
  pool.on("connect", (client) => {
    client.on("error", (error) => {
      console.error(`❌ ${label} client error (checked-out):`, error.message);
      // Do NOT throw — query promise will reject normally
    });
  });
}

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
  throw new Error("Local PostgreSQL environment variables are missing.");
}

export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),

  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,        // recycle idle clients (avoid stale sockets)
  keepAlive: true,                  // TCP keepalive
  keepAliveInitialDelayMillis: 10_000,
  max: 10,
});

attachClientErrorListeners(pool, "Local PostgreSQL");

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
  throw new Error("Live PostgreSQL environment variables are missing.");
}

export const livePool = new Pool({
  user: process.env.LIVE_PGUSER,
  host: process.env.LIVE_PGHOST,
  database: process.env.LIVE_PGDATABASE,
  password: process.env.LIVE_PGPASSWORD,
  port: Number(process.env.LIVE_PGPORT),

  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,        // ⭐ critical for remote DB
  keepAlive: true,                  // ⭐ critical for remote DB
  keepAliveInitialDelayMillis: 10_000,
  max: 5,
});

attachClientErrorListeners(livePool, "Live PostgreSQL");

export const liveDb = drizzle({
  client: livePool,
  schema,
});