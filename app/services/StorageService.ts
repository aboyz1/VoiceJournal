import { executeQuery, executeSql } from "../data/Database";
import { JOURNAL_COLUMNS, JOURNAL_TABLE, JournalEntry } from "../data/schemas";
import { generateId, getCurrentTimestamp, timestampToDate } from "../utils/storageUtils";

// Create a new journal entry
export const createEntry = async (
  entry: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  const id = generateId();
  const now = getCurrentTimestamp();

  const sql = `
    INSERT INTO ${JOURNAL_TABLE} (
      ${JOURNAL_COLUMNS.ID},
      ${JOURNAL_COLUMNS.AUDIO_URI},
      ${JOURNAL_COLUMNS.TEXT},
      ${JOURNAL_COLUMNS.MOOD},
      ${JOURNAL_COLUMNS.CREATED_AT},
      ${JOURNAL_COLUMNS.UPDATED_AT}
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [id, entry.audioUri, entry.text, entry.mood, now, now];

  await executeSql(sql, params);
  return id;
};

// Get all journal entries sorted by date (newest first)
export const getAllEntries = async (): Promise<JournalEntry[]> => {
  const sql = `
    SELECT * FROM ${JOURNAL_TABLE}
    ORDER BY ${JOURNAL_COLUMNS.CREATED_AT} DESC
  `;

  const rows = await executeQuery(sql);
  const entries: JournalEntry[] = [];

  for (const item of rows) {
    entries.push({
      id: item[JOURNAL_COLUMNS.ID],
      audioUri: item[JOURNAL_COLUMNS.AUDIO_URI],
      text: item[JOURNAL_COLUMNS.TEXT],
      mood: item[JOURNAL_COLUMNS.MOOD],
      createdAt: timestampToDate(item[JOURNAL_COLUMNS.CREATED_AT]),
      updatedAt: timestampToDate(item[JOURNAL_COLUMNS.UPDATED_AT]),
    });
  }

  return entries;
};

// Get a single journal entry by ID
export const getEntry = async (id: string): Promise<JournalEntry | null> => {
  const sql = `
    SELECT * FROM ${JOURNAL_TABLE}
    WHERE ${JOURNAL_COLUMNS.ID} = ?
  `;

  const rows = await executeQuery(sql, [id]);

  if (rows.length === 0) {
    return null;
  }

  const item = rows[0];
  return {
    id: item[JOURNAL_COLUMNS.ID],
    audioUri: item[JOURNAL_COLUMNS.AUDIO_URI],
    text: item[JOURNAL_COLUMNS.TEXT],
    mood: item[JOURNAL_COLUMNS.MOOD],
    createdAt: timestampToDate(item[JOURNAL_COLUMNS.CREATED_AT]),
    updatedAt: timestampToDate(item[JOURNAL_COLUMNS.UPDATED_AT]),
  };
};

// Update a journal entry
export const updateEntry = async (
  id: string,
  updates: Partial<JournalEntry>
): Promise<void> => {
  const now = getCurrentTimestamp();

  const sql = `
    UPDATE ${JOURNAL_TABLE}
    SET 
      ${JOURNAL_COLUMNS.TEXT} = ?,
      ${JOURNAL_COLUMNS.MOOD} = ?,
      ${JOURNAL_COLUMNS.UPDATED_AT} = ?
    WHERE ${JOURNAL_COLUMNS.ID} = ?
  `;

  const params = [updates.text, updates.mood, now, id];

  await executeSql(sql, params);
};

// Delete a journal entry
export const deleteEntry = async (id: string): Promise<void> => {
  const sql = `
    DELETE FROM ${JOURNAL_TABLE}
    WHERE ${JOURNAL_COLUMNS.ID} = ?
  `;

  await executeSql(sql, [id]);
};

// Search journal entries by text
export const searchEntries = async (query: string): Promise<JournalEntry[]> => {
  const sql = `
    SELECT * FROM ${JOURNAL_TABLE}
    WHERE ${JOURNAL_COLUMNS.TEXT} LIKE ?
    ORDER BY ${JOURNAL_COLUMNS.CREATED_AT} DESC
  `;

  const rows = await executeQuery(sql, [`%${query}%`]);
  const entries: JournalEntry[] = [];

  for (const item of rows) {
    entries.push({
      id: item[JOURNAL_COLUMNS.ID],
      audioUri: item[JOURNAL_COLUMNS.AUDIO_URI],
      text: item[JOURNAL_COLUMNS.TEXT],
      mood: item[JOURNAL_COLUMNS.MOOD],
      createdAt: timestampToDate(item[JOURNAL_COLUMNS.CREATED_AT]),
      updatedAt: timestampToDate(item[JOURNAL_COLUMNS.UPDATED_AT]),
    });
  }

  return entries;
};
