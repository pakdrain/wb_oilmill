import { pool, livePool } from "./db";

// ============================================================
// DATABASE SYNC SERVICE
// LOCAL PostgreSQL → LIVE PostgreSQL
// ============================================================

const SYNC_INTERVAL = 5 * 60 * 1000;
const BATCH_SIZE = 500;

const SYNC_TABLES = [
  { table: "wb_weighbridge", primaryKey: "wb_id" },
  { table: "wb_weighbridge_items_purchase", primaryKey: "wb_item_p_id" },
];

// ============================================================
// CHECK TABLE EXISTS
// ============================================================

async function tableExists(client: any, tableName: string): Promise<boolean> {
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return result.rows[0]?.exists === true;
}

// ============================================================
// GET TABLE COLUMNS
// ============================================================

async function getTableColumns(client: any, tableName: string): Promise<string[]> {
  const result = await client.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tableName]
  );
  return result.rows.map((row: any) => row.column_name);
}

// ============================================================
// CHECK PRIMARY KEY / UNIQUE CONSTRAINT
// ============================================================

async function checkPrimaryKeyConstraint(
  tableName: string,
  primaryKey: string
): Promise<boolean> {
  const result = await livePool.query(
    `SELECT EXISTS (
       SELECT 1 FROM pg_constraint c
       INNER JOIN pg_class t ON t.oid = c.conrelid
       INNER JOIN pg_namespace n ON n.oid = t.relnamespace
       INNER JOIN pg_attribute a ON a.attrelid = t.oid
       WHERE n.nspname = 'public'
         AND t.relname = $1
         AND a.attname = $2
         AND c.contype IN ('p', 'u')
         AND a.attnum = ANY(c.conkey)
     ) AS exists`,
    [tableName, primaryKey]
  );
  return result.rows[0]?.exists === true;
}

// ============================================================
// TEST DATABASE CONNECTIONS
// ============================================================

async function testDatabaseConnections(): Promise<boolean> {
  console.log("\n====================================================");
  console.log("🔌 TESTING DATABASE CONNECTIONS");
  console.log("====================================================");

  try {
    const localResult = await pool.query(`
      SELECT current_database() AS database, current_user AS username
    `);
    console.log("\n✅ LOCAL DATABASE CONNECTED");
    console.log(localResult.rows[0]);
  } catch (error: any) {
    console.error("\n❌ LOCAL DATABASE CONNECTION FAILED");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    return false;
  }

  try {
    const liveResult = await livePool.query(`
      SELECT current_database() AS database, current_user AS username
    `);
    console.log("\n✅ LIVE DATABASE CONNECTED");
    console.log(liveResult.rows[0]);
  } catch (error: any) {
    console.error("\n❌ LIVE DATABASE CONNECTION FAILED");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    return false;
  }

  console.log("\n====================================================");
  console.log("✅ BOTH DATABASE CONNECTIONS ARE OK");
  console.log("====================================================");
  return true;
}

// ============================================================
// SYNC ONE TABLE — ✅ FIXED: Single connection for transaction
// ============================================================

async function syncTable(tableName: string, primaryKey: string): Promise<number> {
  console.log("\n----------------------------------------------------");
  console.log(`🔄 SYNC TABLE: ${tableName}`);
  console.log("----------------------------------------------------");

  // CHECK LOCAL TABLE
  const localExists = await tableExists(pool, tableName);
  if (!localExists) {
    console.error(`❌ LOCAL TABLE NOT FOUND: ${tableName}`);
    return 0;
  }
  console.log(`✅ Local table exists: ${tableName}`);

  // CHECK LIVE TABLE
  const liveExists = await tableExists(livePool, tableName);
  if (!liveExists) {
    console.error(`❌ LIVE TABLE NOT FOUND: ${tableName}`);
    return 0;
  }
  console.log(`✅ Live table exists: ${tableName}`);

  // GET COLUMNS
  const localColumns = await getTableColumns(pool, tableName);
  const liveColumns = await getTableColumns(livePool, tableName);

  console.log(`📋 Local columns: ${localColumns.length}`);
  console.log(`📋 Live columns: ${liveColumns.length}`);

  // CHECK PRIMARY KEY COLUMN
  if (!localColumns.includes(primaryKey)) {
    console.error(`❌ Local primary key column "${primaryKey}" not found.`);
    return 0;
  }
  if (!liveColumns.includes(primaryKey)) {
    console.error(`❌ Live primary key column "${primaryKey}" not found.`);
    return 0;
  }
  console.log(`🔑 Primary Key: ${primaryKey}`);

  // CHECK LIVE PK / UNIQUE CONSTRAINT
  const hasConstraint = await checkPrimaryKeyConstraint(tableName, primaryKey);
  if (!hasConstraint) {
    console.error(`\n❌ LIVE TABLE DOES NOT HAVE PRIMARY KEY / UNIQUE CONSTRAINT`);
    console.error(`❌ Table: ${tableName}`);
    console.error(`❌ Column: ${primaryKey}`);
    console.error(`⚠️ ON CONFLICT ("${primaryKey}") CANNOT WORK.`);
    return 0;
  }
  console.log(`✅ LIVE constraint found for ${primaryKey}`);

  // COMMON COLUMNS
  const columns = localColumns.filter((column) => liveColumns.includes(column));
  if (!columns.includes(primaryKey)) {
    console.error(`❌ Primary key is not available in both tables.`);
    return 0;
  }
  console.log(`📋 Common columns: ${columns.length}`);

  const columnList = columns.map((column) => `"${column}"`).join(", ");

  // COUNT LOCAL RECORDS
  const countResult = await pool.query(
    `SELECT COUNT(*)::bigint AS total FROM "${tableName}"`
  );
  const totalRecords = Number(countResult.rows[0]?.total || 0);

  if (totalRecords === 0) {
    console.log(`ℹ️ ${tableName}: No local records.`);
    return 0;
  }

  console.log(`📦 Local records: ${totalRecords}`);
  console.log(`📦 Batch size: ${BATCH_SIZE}`);

  // UPDATE COLUMNS
  const updateColumns = columns.filter((column) => column !== primaryKey);
  const updateSet = updateColumns
    .map((column) => `"${column}" = EXCLUDED."${column}"`)
    .join(", ");

  // PROCESS BATCHES
  let syncedCount = 0;
  let offset = 0;

  while (offset < totalRecords) {
    console.log(`\n📥 Reading ${tableName}: OFFSET ${offset}`);

    const batchResult = await pool.query(
      `SELECT ${columnList} FROM "${tableName}"
       ORDER BY "${primaryKey}" LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset]
    );

    const rows = batchResult.rows;
    if (rows.length === 0) break;

    console.log(`📦 Batch received: ${rows.length} records`);

    // ✅ FIX: Single client from pool for the whole transaction
    const liveClient = await livePool.connect();

    try {
      await liveClient.query("BEGIN");

      const values: any[] = [];
      const valueGroups: string[] = [];

      rows.forEach((row: any, rowIndex: number) => {
        const placeholders = columns.map((_, columnIndex) => {
          const parameterNumber = rowIndex * columns.length + columnIndex + 1;
          return `$${parameterNumber}`;
        });
        valueGroups.push(`(${placeholders.join(", ")})`);
        columns.forEach((column) => {
          values.push(row[column]);
        });
      });

      let query: string;
      if (updateColumns.length > 0) {
        query = `
          INSERT INTO "${tableName}" (${columnList})
          VALUES ${valueGroups.join(", ")}
          ON CONFLICT ("${primaryKey}") DO UPDATE SET ${updateSet}
        `;
      } else {
        query = `
          INSERT INTO "${tableName}" (${columnList})
          VALUES ${valueGroups.join(", ")}
          ON CONFLICT ("${primaryKey}") DO NOTHING
        `;
      }

      await liveClient.query(query, values);
      await liveClient.query("COMMIT");

      syncedCount += rows.length;

      const percentage = (syncedCount / totalRecords) * 100;
      console.log(`✅ ${tableName}: ${syncedCount}/${totalRecords} (${percentage.toFixed(1)}%)`);

    } catch (error: any) {
      try {
        await liveClient.query("ROLLBACK");
      } catch { /* ignore */ }

      console.error(`\n❌ SYNC ERROR IN TABLE: ${tableName}`);
      console.error("Message:", error?.message);
      console.error("Code:", error?.code);
      console.error("Detail:", error?.detail);
      console.error("Hint:", error?.hint);
      console.error("Position:", error?.position);

      throw error;

    } finally {
      // ✅ FIX: Client wapas pool mein return karein
      liveClient.release();
    }

    offset += rows.length;
  }

  console.log(`\n🎯 ${tableName}: ${syncedCount}/${totalRecords} records synchronized.`);
  return syncedCount;
}


// ============================================================
// FBR COPY — INSERT ONLY, RECORDS OLDER THAN 10 DAYS
// This is separate from the existing LOCAL → LIVE sync.
// It copies records dated before the last-10-days cutoff into the LIVE FBR tables.
// ============================================================

const FBR_LOOKBACK_DAYS = 10;

async function insertFbrRows(
  targetTable: string,
  columns: string[],
  rows: any[],
  conflictKey?: string
): Promise<number> {
  if (rows.length === 0 || columns.length === 0) return 0;

  let insertedCount = 0;

  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const batch = rows.slice(offset, offset + BATCH_SIZE);
    const values: any[] = [];
    const groups: string[] = [];

    for (const row of batch) {
      const placeholders = columns.map((column) => {
        values.push(row[column]);
        return `$${values.length}`;
      });
      groups.push(`(${placeholders.join(", ")})`);
    }

    const columnList = columns.map((column) => `"${column}"`).join(", ");
    const conflictClause = conflictKey === "*"
      ? " ON CONFLICT DO NOTHING"
      : conflictKey
        ? ` ON CONFLICT ("${conflictKey}") DO NOTHING`
        : "";

    const query = `
      INSERT INTO "${targetTable}" (${columnList})
      VALUES ${groups.join(", ")}
      ${conflictClause}
    `;

    await livePool.query({ text: query, values });
    insertedCount += batch.length;
  }

  return insertedCount;
}

async function getExistingWbIds(
  tableName: string,
  wbIds: (number | string)[]
): Promise<Set<string>> {
  const existing = new Set<string>();

  for (let offset = 0; offset < wbIds.length; offset += BATCH_SIZE) {
    const batchIds = wbIds.slice(offset, offset + BATCH_SIZE);
    if (batchIds.length === 0) continue;

    const result = await livePool.query(
      `SELECT DISTINCT wb_id FROM "${tableName}" WHERE wb_id = ANY($1::bigint[])`,
      [batchIds]
    );

    for (const row of result.rows) {
      if (row.wb_id !== null && row.wb_id !== undefined) {
        existing.add(String(row.wb_id));
      }
    }
  }

  return existing;
}

async function syncFbrTables(): Promise<void> {
  console.log("\\n====================================================");
  console.log("🧾 FBR COPY STARTED — ALL RECORDS OLDER THAN 10 DAYS, INSERT ONLY");
  console.log("====================================================");

  const sourceMaster = "wb_weighbridge";
  const targetMaster = "wb_weighbridge_fbr";
  const sourceDetail = "wb_weighbridge_items_purchase";
  const targetDetail = "wb_weighbridge_items_purchase_fbr";

  // Verify that all four tables exist before copying.
  for (const [client, tableName, databaseLabel] of [
    [pool, sourceMaster, "LOCAL"],
    [pool, sourceDetail, "LOCAL"],
    [livePool, targetMaster, "LIVE"],
    [livePool, targetDetail, "LIVE"],
  ] as [any, string, string][]) {
    if (!(await tableExists(client, tableName))) {
      console.error(`❌ ${databaseLabel} FBR source/target table not found: ${tableName}`);
      return;
    }
  }

  const localMasterColumns = await getTableColumns(pool, sourceMaster);
  const liveMasterColumns = await getTableColumns(livePool, targetMaster);
  const masterColumns = localMasterColumns.filter((column) =>
    liveMasterColumns.includes(column)
  );

  if (!masterColumns.includes("wb_id")) {
    console.error("❌ FBR master copy requires wb_id in both master tables.");
    return;
  }

  // Select only records whose creation_date is more than 10 calendar days old.
  const masterColumnList = masterColumns.map((column) => `"${column}"`).join(", ");
  const recentMasterResult = await pool.query(
    `SELECT ${masterColumnList}
       FROM "${sourceMaster}"
      WHERE creation_date::date < NOW()::date - $1::integer
      ORDER BY wb_id`,
    [FBR_LOOKBACK_DAYS]
  );

  const recentMasters = recentMasterResult.rows;
  if (recentMasters.length === 0) {
    console.log("ℹ️ No local master records found older than 10 days.");
    return;
  }

  const recentWbIds = [
    ...new Set(recentMasters
      .map((row: any) => row.wb_id)
      .filter((id: any) => id !== null && id !== undefined)
      .map((id: any) => String(id))),
  ];

  const existingMasterIds = await getExistingWbIds(targetMaster, recentWbIds);
  const mastersToInsert = recentMasters.filter(
    (row: any) => !existingMasterIds.has(String(row.wb_id))
  );

  const masterInserted = await insertFbrRows(
    targetMaster,
    masterColumns,
    mastersToInsert,
    "wb_id"
  );

  console.log(
    `✅ FBR master: ${masterInserted} new record(s) inserted from records older than 10 days; existing records left unchanged.`
  );

  // Detail rows are joined to their master and use the same creation_date cutoff.
  // Copy only when the LIVE FBR detail table has no rows for that wb_id. The detail PK
  // is generated by the destination table, while wb_id preserves the relation.
  const localDetailColumns = await getTableColumns(pool, sourceDetail);
  const liveDetailColumns = await getTableColumns(livePool, targetDetail);
  const detailColumns = localDetailColumns.filter(
    (column) =>
      liveDetailColumns.includes(column) &&
      column !== "wb_item_p_id"
  );

  if (!detailColumns.includes("wb_id")) {
    console.error("❌ FBR detail copy requires wb_id in both detail tables.");
    return;
  }

  const existingDetailWbIds = await getExistingWbIds(targetDetail, recentWbIds);
  const wbIdsWithoutDetails = recentWbIds.filter(
    (wbId) => !existingDetailWbIds.has(String(wbId))
  );

  let detailRows: any[] = [];
  for (let offset = 0; offset < wbIdsWithoutDetails.length; offset += BATCH_SIZE) {
    const wbIdBatch = wbIdsWithoutDetails.slice(offset, offset + BATCH_SIZE);
    const detailColumnList = detailColumns
      .map((column) => `wwip."${column}"`)
      .join(", ");

    const detailResult = await pool.query(
      `SELECT ${detailColumnList}
         FROM "${sourceDetail}" wwip
         INNER JOIN "${sourceMaster}" wb ON wb.wb_id = wwip.wb_id
        WHERE wwip.wb_id = ANY($1::bigint[])
          AND wb.creation_date::date < NOW()::date - $2::integer
        ORDER BY wwip.wb_id, wwip.wb_item_p_id`,
      [wbIdBatch, FBR_LOOKBACK_DAYS]
    );

    detailRows.push(...detailResult.rows);
  }

  const detailInserted = await insertFbrRows(targetDetail, detailColumns, detailRows, "*");
  console.log(
    `✅ FBR detail: ${detailInserted} new record(s) inserted; wb_id relation preserved.`
  );
  console.log("🎯 FBR copy completed. Existing FBR entries were not updated.");
}

// ============================================================
// MAIN SYNC
// ============================================================

let syncRunning = false;
let connectionsTested = false;  // ✅ FIX: Sirf pehli baar test

export async function syncLocalToLive(): Promise<void> {
  if (syncRunning) {
    console.log("⚠️ Sync already running. Skipping this cycle.");
    return;
  }

  syncRunning = true;
  const startTime = Date.now();

  console.log("\n====================================================");
  console.log("🔄 LOCAL → LIVE DATABASE SYNC STARTED");
  console.log("====================================================");
  console.log(
    `📅 ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}`
  );

  try {
    // ✅ FIX: Sirf pehli baar connection test
    if (!connectionsTested) {
      const connectionOK = await testDatabaseConnections();
      if (!connectionOK) {
        console.error("❌ Database connection test failed.");
        console.error("🔁 Sync will retry on next cycle.");
        return;
      }
      connectionsTested = true;
    }

    let totalRecords = 0;

    for (const config of SYNC_TABLES) {
      try {
        const count = await syncTable(config.table, config.primaryKey);
        totalRecords += count;
      } catch (error: any) {
        console.error(`\n❌ FAILED: ${config.table}`);
        console.error("Message:", error?.message);
        console.error("Code:", error?.code);
        console.error("Detail:", error?.detail);
      }
    }

    // Keep the existing two-table sync unchanged; run the separate FBR insert-only copy.
    try {
      await syncFbrTables();
    } catch (error: any) {
      console.error("❌ FBR copy failed:", error?.message);
      console.error("Code:", error?.code);
      console.error("Detail:", error?.detail);
    }

    const duration = Date.now() - startTime;
    console.log("\n====================================================");
    console.log("✅ DATABASE SYNC COMPLETED");
    console.log(`📦 Total records processed: ${totalRecords}`);
    console.log(`⏱️ Duration: ${(duration / 1000).toFixed(2)} seconds`);
    console.log("====================================================");

  } catch (error: any) {
    console.error("\n====================================================");
    console.error("❌ DATABASE SYNC FAILED");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    console.error("====================================================");
    console.error("🔁 Local data is safe. Next scheduled sync will retry.");

  } finally {
    syncRunning = false;
  }
}

// ============================================================
// START AUTOMATIC SYNC — ✅ FIXED: Recursive setTimeout
// ============================================================

export function startDatabaseSync(): void {
  console.log("\n====================================================");
  console.log("⏰ DATABASE AUTO-SYNC ENABLED");
  console.log("====================================================");
  console.log("📍 Source: LOCAL PostgreSQL");
  console.log("📍 Destination: LIVE PostgreSQL");
  console.log("📋 Tables:");
  console.log("   1. wb_weighbridge");
  console.log("   2. wb_weighbridge_items_purchase");
  console.log("   FBR insert-only copy (all records older than 10 days):");
  console.log("   3. wb_weighbridge → wb_weighbridge_fbr");
  console.log("   4. wb_weighbridge_items_purchase → wb_weighbridge_items_purchase_fbr");
  console.log("🔑 Master PK: wb_id");
  console.log("🔑 Purchase Detail PK: wb_item_p_id");
  console.log(`📦 Batch Size: ${BATCH_SIZE}`);
  console.log("⏱️ Interval: Every 5 minutes");
  console.log("====================================================");

  // ✅ FIX: Recursive scheduler — overlap impossible
  const scheduleNext = () => {
    setTimeout(async () => {
      try {
        await syncLocalToLive();
      } catch (err: any) {
        console.error("❌ Sync cycle error:", err?.message);
      } finally {
        scheduleNext();
      }
    }, SYNC_INTERVAL);
  };

  // First sync after 10 seconds
  setTimeout(async () => {
    try {
      await syncLocalToLive();
    } catch (err: any) {
      console.error("❌ First sync error:", err?.message);
    } finally {
      scheduleNext();
    }
  }, 10000);
}