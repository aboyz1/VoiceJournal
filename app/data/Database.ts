import * as SQLite from "expo-sqlite";
import {
  ADD_DURATION_COLUMN,
  CREATE_DATE_INDEX,
  CREATE_JOURNAL_TABLE,
  CREATE_TEXT_INDEX,
  JOURNAL_COLUMNS,
  JOURNAL_TABLE,
} from "./schemas";

let db: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

// Initialize database tables
export const initDatabase = async (): Promise<void> => {
  try {
    if (!db) {
      console.log("[Database] Opening database...");
      db = SQLite.openDatabaseSync("voicejournal.db");
      console.log("[Database] Database opened successfully");
    }

    if (isInitialized) {
      console.log("[Database] Database already initialized");
      return;
    }

    console.log("[Database] Creating tables...");

    // Create the main table
    await db.runAsync(CREATE_JOURNAL_TABLE);
    console.log("[Database] Journal table created");

    // Create indexes
    await db.runAsync(CREATE_TEXT_INDEX);
    await db.runAsync(CREATE_DATE_INDEX);
    console.log("[Database] Indexes created");

    // Check if duration column exists, if not add it (for existing databases)
    const result = await db.getAllAsync(`PRAGMA table_info(${JOURNAL_TABLE})`);
    const hasDurationColumn = result.some(
      (col: any) => col.name === JOURNAL_COLUMNS.DURATION
    );

    if (!hasDurationColumn) {
      console.log("[Database] Adding duration column to existing table");
      await db.runAsync(ADD_DURATION_COLUMN);
    }

    isInitialized = true;
    console.log("[Database] Database initialized successfully");
  } catch (error) {
    console.error("[Database] Error initializing database:", error);
    db = null;
    isInitialized = false;
    throw error;
  }
};

// Execute a SQL query with parameters
export const executeSql = async (
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> => {
  try {
    if (!db || !isInitialized) {
      throw new Error("Database not initialized. Call initDatabase() first.");
    }
    if (params.length > 0) {
      return await db.runAsync(sql, params);
    } else {
      return await db.runAsync(sql);
    }
  } catch (error) {
    console.error("SQL execution error:", error);
    throw error;
  }
};

// Execute a SELECT query and return results
export const executeQuery = async (
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    if (!db || !isInitialized) {
      throw new Error("Database not initialized. Call initDatabase() first.");
    }
    if (params.length > 0) {
      return await db.getAllAsync(sql, params);
    } else {
      return await db.getAllAsync(sql);
    }
  } catch (error) {
    console.error("Query execution error:", error);
    throw error;
  }
};

// Get the database instance
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db || !isInitialized) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};

// Check if database is initialized
export const isDatabaseInitialized = (): boolean => {
  return db !== null && isInitialized;
};
