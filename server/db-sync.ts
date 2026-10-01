import { pool, livePool } from "./db";

// ============================================================
// DATABASE SYNC SERVICE
// LOCAL PostgreSQL → LIVE PostgreSQL
//
// TABLES:
// 1. wb_weighbridge
// 2. wb_weighbridge_items_purchase
//
// TESTING:
// Every 5 minutes
//
// LOCAL DATABASE:
// NEVER modified / deleted
//
// LIVE DATABASE:
// INSERT / UPDATE using UPSERT
// ============================================================


// ============================================================
// SETTINGS
// ============================================================

const SYNC_INTERVAL = 5 * 60 * 1000;

const BATCH_SIZE = 500;


// ============================================================
// TABLE CONFIGURATION
// ============================================================

const SYNC_TABLES = [
  {
    table: "wb_weighbridge",
    primaryKey: "wb_id",
  },
  {
    table: "wb_weighbridge_items_purchase",
    primaryKey: "wb_item_p_id",
  },
];


// ============================================================
// CHECK TABLE EXISTS
// ============================================================

async function tableExists(
  client: any,
  tableName: string,
): Promise<boolean> {

  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName],
  );

  return result.rows[0]?.exists === true;
}


// ============================================================
// GET TABLE COLUMNS
// ============================================================

async function getTableColumns(
  client: any,
  tableName: string,
): Promise<string[]> {

  const result = await client.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName],
  );

  return result.rows.map(
    (row: any) => row.column_name,
  );
}


// ============================================================
// CHECK PRIMARY KEY / UNIQUE CONSTRAINT
// ============================================================

async function checkPrimaryKeyConstraint(
  tableName: string,
  primaryKey: string,
): Promise<boolean> {

  const result = await livePool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        INNER JOIN pg_class t
          ON t.oid = c.conrelid
        INNER JOIN pg_namespace n
          ON n.oid = t.relnamespace
        INNER JOIN pg_attribute a
          ON a.attrelid = t.oid
        WHERE n.nspname = 'public'
          AND t.relname = $1
          AND a.attname = $2
          AND c.contype IN ('p', 'u')
          AND a.attnum = ANY(c.conkey)
      ) AS exists
    `,
    [
      tableName,
      primaryKey,
    ],
  );

  return result.rows[0]?.exists === true;
}


// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

async function testDatabaseConnections(): Promise<boolean> {

  console.log("");
  console.log("====================================================");
  console.log("🔌 TESTING DATABASE CONNECTIONS");
  console.log("====================================================");


  // ----------------------------------------------------------
  // LOCAL
  // ----------------------------------------------------------

  try {

    const localResult =
      await pool.query(`
        SELECT
          current_database() AS database,
          current_user AS username,
          inet_server_addr() AS server_ip,
          inet_server_port() AS server_port
      `);

    console.log("");
    console.log("✅ LOCAL DATABASE CONNECTED");
    console.log(localResult.rows[0]);

  } catch (error: any) {

    console.error("");
    console.error("❌ LOCAL DATABASE CONNECTION FAILED");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);

    return false;
  }


  // ----------------------------------------------------------
  // LIVE
  // ----------------------------------------------------------

  try {

    const liveResult =
      await livePool.query(`
        SELECT
          current_database() AS database,
          current_user AS username,
          inet_server_addr() AS server_ip,
          inet_server_port() AS server_port
      `);

    console.log("");
    console.log("✅ LIVE DATABASE CONNECTED");
    console.log(liveResult.rows[0]);

  } catch (error: any) {

    console.error("");
    console.error("❌ LIVE DATABASE CONNECTION FAILED");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);

    return false;
  }


  console.log("");
  console.log("====================================================");
  console.log("✅ BOTH DATABASE CONNECTIONS ARE OK");
  console.log("====================================================");

  return true;
}


// ============================================================
// SYNC ONE TABLE
// ============================================================

async function syncTable(
  tableName: string,
  primaryKey: string,
): Promise<number> {

  console.log("");
  console.log("----------------------------------------------------");
  console.log(`🔄 SYNC TABLE: ${tableName}`);
  console.log("----------------------------------------------------");


  // ==========================================================
  // CHECK LOCAL TABLE
  // ==========================================================

  const localExists =
    await tableExists(
      pool,
      tableName,
    );

  if (!localExists) {

    console.error(
      `❌ LOCAL TABLE NOT FOUND: ${tableName}`,
    );

    return 0;
  }


  console.log(
    `✅ Local table exists: ${tableName}`,
  );


  // ==========================================================
  // CHECK LIVE TABLE
  // ==========================================================

  const liveExists =
    await tableExists(
      livePool,
      tableName,
    );

  if (!liveExists) {

    console.error(
      `❌ LIVE TABLE NOT FOUND: ${tableName}`,
    );

    return 0;
  }


  console.log(
    `✅ Live table exists: ${tableName}`,
  );


  // ==========================================================
  // GET COLUMNS
  // ==========================================================

  const localColumns =
    await getTableColumns(
      pool,
      tableName,
    );

  const liveColumns =
    await getTableColumns(
      livePool,
      tableName,
    );


  console.log(
    `📋 Local columns: ${localColumns.length}`,
  );

  console.log(
    `📋 Live columns: ${liveColumns.length}`,
  );


  // ==========================================================
  // CHECK PRIMARY KEY COLUMN
  // ==========================================================

  if (!localColumns.includes(primaryKey)) {

    console.error(
      `❌ Local primary key column "${primaryKey}" not found.`,
    );

    return 0;
  }


  if (!liveColumns.includes(primaryKey)) {

    console.error(
      `❌ Live primary key column "${primaryKey}" not found.`,
    );

    return 0;
  }


  console.log(
    `🔑 Primary Key: ${primaryKey}`,
  );


  // ==========================================================
  // CHECK LIVE PK / UNIQUE CONSTRAINT
  // ==========================================================

  const hasConstraint =
    await checkPrimaryKeyConstraint(
      tableName,
      primaryKey,
    );


  if (!hasConstraint) {

    console.error("");
    console.error(
      `❌ LIVE TABLE DOES NOT HAVE PRIMARY KEY / UNIQUE CONSTRAINT`,
    );

    console.error(
      `❌ Table: ${tableName}`,
    );

    console.error(
      `❌ Column: ${primaryKey}`,
    );

    console.error(
      `⚠️ ON CONFLICT ("${primaryKey}") CANNOT WORK.`,
    );

    return 0;
  }


  console.log(
    `✅ LIVE constraint found for ${primaryKey}`,
  );


  // ==========================================================
  // COMMON COLUMNS
  // ==========================================================

  const columns =
    localColumns.filter(
      (column) =>
        liveColumns.includes(column),
    );


  if (!columns.includes(primaryKey)) {

    console.error(
      `❌ Primary key is not available in both tables.`,
    );

    return 0;
  }


  console.log(
    `📋 Common columns: ${columns.length}`,
  );


  const columnList =
    columns
      .map(
        (column) =>
          `"${column}"`,
      )
      .join(", ");


  // ==========================================================
  // COUNT LOCAL RECORDS
  // ==========================================================

  const countResult =
    await pool.query(
      `
        SELECT COUNT(*)::bigint AS total
        FROM "${tableName}"
      `,
    );


  const totalRecords =
    Number(
      countResult.rows[0]?.total || 0,
    );


  if (totalRecords === 0) {

    console.log(
      `ℹ️ ${tableName}: No local records.`,
    );

    return 0;
  }


  console.log(
    `📦 Local records: ${totalRecords}`,
  );

  console.log(
    `📦 Batch size: ${BATCH_SIZE}`,
  );


  // ==========================================================
  // UPDATE COLUMNS
  // ==========================================================

  const updateColumns =
    columns.filter(
      (column) =>
        column !== primaryKey,
    );


  const updateSet =
    updateColumns
      .map(
        (column) =>
          `"${column}" = EXCLUDED."${column}"`,
      )
      .join(", ");


  // ==========================================================
  // PROCESS BATCHES
  // ==========================================================

  let syncedCount = 0;

  let offset = 0;


  while (offset < totalRecords) {

    console.log("");
    console.log(
      `📥 Reading ${tableName}: OFFSET ${offset}`,
    );


    // --------------------------------------------------------
    // GET LOCAL BATCH
    // --------------------------------------------------------

    const batchResult =
      await pool.query(
        `
          SELECT ${columnList}
          FROM "${tableName}"
          ORDER BY "${primaryKey}"
          LIMIT $1
          OFFSET $2
        `,
        [
          BATCH_SIZE,
          offset,
        ],
      );


    const rows =
      batchResult.rows;


    if (rows.length === 0) {

      break;
    }


    console.log(
      `📦 Batch received: ${rows.length} records`,
    );


    // ========================================================
    // START LIVE TRANSACTION
    // ========================================================

    await livePool.query(
      "BEGIN",
    );


    try {

      const values: any[] = [];

      const valueGroups: string[] = [];


      // ------------------------------------------------------
      // BUILD VALUES
      // ------------------------------------------------------

      rows.forEach(
        (
          row: any,
          rowIndex: number,
        ) => {

          const placeholders =
            columns.map(
              (
                _,
                columnIndex,
              ) => {

                const parameterNumber =
                  rowIndex *
                    columns.length +
                  columnIndex +
                  1;

                return `$${parameterNumber}`;
              },
            );


          valueGroups.push(
            `(${placeholders.join(", ")})`,
          );


          columns.forEach(
            (column) => {

              values.push(
                row[column],
              );

            },
          );
        },
      );


      // ======================================================
      // BUILD UPSERT QUERY
      // ======================================================

      let query: string;


      if (updateColumns.length > 0) {

        query = `
          INSERT INTO "${tableName}"
          (${columnList})
          VALUES ${valueGroups.join(", ")}

          ON CONFLICT ("${primaryKey}")
          DO UPDATE SET
            ${updateSet}
        `;

      } else {

        query = `
          INSERT INTO "${tableName}"
          (${columnList})
          VALUES ${valueGroups.join(", ")}

          ON CONFLICT ("${primaryKey}")
          DO NOTHING
        `;
      }


      // ======================================================
      // EXECUTE LIVE QUERY
      // ======================================================

      await livePool.query(
        query,
        values,
      );


      // ======================================================
      // COMMIT
      // ======================================================

      await livePool.query(
        "COMMIT",
      );


      syncedCount += rows.length;


      const percentage =
        (
          syncedCount /
          totalRecords
        ) *
        100;


      console.log(
        `✅ ${tableName}: ${syncedCount}/${totalRecords} (${percentage.toFixed(1)}%)`,
      );

    } catch (error: any) {

      // ------------------------------------------------------
      // ROLLBACK
      // ------------------------------------------------------

      try {

        await livePool.query(
          "ROLLBACK",
        );

      } catch {
        // Ignore rollback error
      }


      // ------------------------------------------------------
      // DETAILED ERROR
      // ------------------------------------------------------

      console.error("");
      console.error(
        `❌ SYNC ERROR IN TABLE: ${tableName}`,
      );

      console.error(
        "Message:",
        error?.message,
      );

      console.error(
        "Code:",
        error?.code,
      );

      console.error(
        "Detail:",
        error?.detail,
      );

      console.error(
        "Hint:",
        error?.hint,
      );

      console.error(
        "Position:",
        error?.position,
      );

      console.error("");


      throw error;
    }


    // --------------------------------------------------------
    // NEXT BATCH
    // --------------------------------------------------------

    offset += rows.length;
  }


  // ==========================================================
  // COMPLETE
  // ==========================================================

  console.log("");
  console.log(
    `🎯 ${tableName}: ${syncedCount}/${totalRecords} records synchronized.`,
  );


  return syncedCount;
}


// ============================================================
// MAIN SYNC
// ============================================================

let syncRunning = false;


export async function syncLocalToLive(): Promise<void> {

  // ==========================================================
  // PREVENT OVERLAPPING SYNC
  // ==========================================================

  if (syncRunning) {

    console.log(
      "⚠️ Sync already running. Skipping this cycle.",
    );

    return;
  }


  syncRunning = true;


  const startTime =
    Date.now();


  console.log("");
  console.log(
    "====================================================",
  );

  console.log(
    "🔄 LOCAL → LIVE DATABASE SYNC STARTED",
  );

  console.log(
    "====================================================",
  );

  console.log(
    `📅 ${new Date().toLocaleString(
      "en-PK",
      {
        timeZone:
          "Asia/Karachi",
      },
    )}`,
  );


  try {

    // ========================================================
    // TEST CONNECTIONS
    // ========================================================

    const connectionOK =
      await testDatabaseConnections();


    if (!connectionOK) {

      console.error(
        "❌ Database connection test failed.",
      );

      console.error(
        "🔁 Sync will retry on next cycle.",
      );

      return;
    }


    // ========================================================
    // SYNC TABLES
    // ========================================================

    let totalRecords = 0;


    for (
      const config
      of SYNC_TABLES
    ) {

      try {

        const count =
          await syncTable(
            config.table,
            config.primaryKey,
          );


        totalRecords += count;

      } catch (
        error: any
      ) {

        console.error("");
        console.error(
          `❌ FAILED: ${config.table}`,
        );

        console.error(
          "Message:",
          error?.message,
        );

        console.error(
          "Code:",
          error?.code,
        );

        console.error(
          "Detail:",
          error?.detail,
        );

        console.error("");

        // Continue to next table
      }
    }


    // ========================================================
    // COMPLETE
    // ========================================================

    const duration =
      Date.now() - startTime;


    console.log("");
    console.log(
      "====================================================",
    );

    console.log(
      "✅ DATABASE SYNC COMPLETED",
    );

    console.log(
      `📦 Total records processed: ${totalRecords}`,
    );

    console.log(
      `⏱️ Duration: ${(duration / 1000).toFixed(2)} seconds`,
    );

    console.log(
      "====================================================",
    );

  } catch (
    error: any
  ) {

    console.error("");
    console.error(
      "====================================================",
    );

    console.error(
      "❌ DATABASE SYNC FAILED",
    );

    console.error(
      "Message:",
      error?.message,
    );

    console.error(
      "Code:",
      error?.code,
    );

    console.error(
      "Detail:",
      error?.detail,
    );

    console.error(
      "====================================================",
    );

    console.error(
      "🔁 Local data is safe. Next scheduled sync will retry.",
    );

  } finally {

    syncRunning = false;
  }
}


// ============================================================
// START AUTOMATIC SYNC
// ============================================================

export function startDatabaseSync(): void {

  console.log("");
  console.log(
    "====================================================",
  );

  console.log(
    "⏰ DATABASE AUTO-SYNC ENABLED",
  );

  console.log(
    "====================================================",
  );

  console.log(
    "📍 Source: LOCAL PostgreSQL",
  );

  console.log(
    "📍 Destination: LIVE PostgreSQL",
  );

  console.log(
    "📋 Tables:",
  );

  console.log(
    "   1. wb_weighbridge",
  );

  console.log(
    "   2. wb_weighbridge_items_purchase",
  );

  console.log(
    "🔑 Master PK: wb_id",
  );

  console.log(
    "🔑 Purchase Detail PK: wb_item_p_id",
  );

  console.log(
    `📦 Batch Size: ${BATCH_SIZE}`,
  );

  console.log(
    "⏱️ Interval: Every 5 minutes",
  );

  console.log(
    "====================================================",
  );


  // ==========================================================
  // FIRST SYNC AFTER 10 SECONDS
  // ==========================================================

  setTimeout(() => {

    syncLocalToLive();

  }, 10000);


  // ==========================================================
  // REPEAT EVERY 5 MINUTES
  // ==========================================================

  setInterval(() => {

    syncLocalToLive();

  }, SYNC_INTERVAL);
}