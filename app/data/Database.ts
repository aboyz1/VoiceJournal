import * as SQLite from 'expo-sqlite';
import {
  CREATE_JOURNAL_TABLE,
  CREATE_TEXT_INDEX,
  CREATE_DATE_INDEX
} from './schemas';

// Open or create database
const db = SQLite.openDatabaseSync('voice_journal.db');

// Initialize database tables
export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(CREATE_JOURNAL_TABLE);
    await db.execAsync(CREATE_TEXT_INDEX);
    await db.execAsync(CREATE_DATE_INDEX);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Execute a SQL query with parameters
export const executeSql = async (
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> => {
  try {
    if (params.length > 0) {
      return await db.runAsync(sql, params);
    } else {
      return await db.runAsync(sql);
    }
  } catch (error) {
    console.error('SQL execution error:', error);
    throw error;
  }
};

// Execute a SELECT query and return results
export const executeQuery = async (
  sql: string,
  params: any[] = []
): Promise<any[]> => {
  try {
    if (params.length > 0) {
      return await db.getAllAsync(sql, params);
    } else {
      return await db.getAllAsync(sql);
    }
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
};

// Get the database instance
export const getDatabase = () => db;