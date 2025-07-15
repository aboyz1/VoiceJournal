import { getDatabase, initDatabase, isDatabaseInitialized } from "../data/Database";
import { JOURNAL_COLUMNS, JOURNAL_TABLE, JournalEntry } from "../data/schemas";
import { generateId } from "../utils/storageUtils";

// Ensure database is initialized before any operation
const ensureDbInitialized = async () => {
  if (!isDatabaseInitialized()) {
    console.log("[StorageService] Database not initialized, initializing...");
    await initDatabase();
  }
  return getDatabase();
};

export const saveEntry = async (
  entry: Omit<JournalEntry, "createdAt" | "updatedAt">
): Promise<void> => {
  try {
    const db = await ensureDbInitialized();
    const now = Date.now();

    await db.runAsync(
      `INSERT INTO ${JOURNAL_TABLE} (
        ${JOURNAL_COLUMNS.ID}, 
        ${JOURNAL_COLUMNS.AUDIO_URI}, 
        ${JOURNAL_COLUMNS.TEXT}, 
        ${JOURNAL_COLUMNS.MOOD}, 
        ${JOURNAL_COLUMNS.DURATION},
        ${JOURNAL_COLUMNS.CREATED_AT}, 
        ${JOURNAL_COLUMNS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.audioUri,
        entry.text,
        entry.mood,
        entry.duration || 0,
        now,
        now,
      ]
    );

    console.log("[StorageService] Entry saved successfully");
  } catch (error) {
    console.error("[StorageService] Error saving entry:", error);
    throw error;
  }
};

// Add createEntry function that ReviewScreen.tsx expects
export const createEntry = async (
  entryData: Omit<JournalEntry, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const id = generateId();
    const entry = {
      ...entryData,
      id,
      duration: entryData.duration || 0,
    };

    await saveEntry(entry);
    return id;
  } catch (error) {
    console.error("[StorageService] Error creating entry:", error);
    throw error;
  }
};

// Add getEntry function that ReviewScreen.tsx expects (alias to getEntryById)
export const getEntry = async (id: string): Promise<JournalEntry | null> => {
  return getEntryById(id);
};

export const getEntryById = async (
  id: string
): Promise<JournalEntry | null> => {
  try {
    const db = await ensureDbInitialized();
    const result = await db.getFirstAsync(
      `SELECT * FROM ${JOURNAL_TABLE} WHERE ${JOURNAL_COLUMNS.ID} = ?`,
      [id]
    ) as { [key: string]: any } | undefined;

    if (result) {
      const entry: JournalEntry = {
        id: result[JOURNAL_COLUMNS.ID] as string,
        audioUri: result[JOURNAL_COLUMNS.AUDIO_URI] as string,
        text: result[JOURNAL_COLUMNS.TEXT] as string,
        mood: result[JOURNAL_COLUMNS.MOOD] as any,
        duration: (result[JOURNAL_COLUMNS.DURATION] as number) || 0,
        createdAt: new Date(result[JOURNAL_COLUMNS.CREATED_AT] as number),
        updatedAt: new Date(result[JOURNAL_COLUMNS.UPDATED_AT] as number),
      };
      return entry;
    }

    return null;
  } catch (error) {
    console.error("[StorageService] Error retrieving entry:", error);
    throw error;
  }
};

export const getAllEntries = async (): Promise<JournalEntry[]> => {
  try {
    const db = await ensureDbInitialized();
    const result = await db.getAllAsync(
      `SELECT * FROM ${JOURNAL_TABLE} ORDER BY ${JOURNAL_COLUMNS.CREATED_AT} DESC`
    );

    const entries: JournalEntry[] = result.map((row: any) => ({
      id: row[JOURNAL_COLUMNS.ID],
      audioUri: row[JOURNAL_COLUMNS.AUDIO_URI],
      text: row[JOURNAL_COLUMNS.TEXT],
      mood: row[JOURNAL_COLUMNS.MOOD],
      duration: row[JOURNAL_COLUMNS.DURATION] || 0,
      createdAt: new Date(row[JOURNAL_COLUMNS.CREATED_AT]),
      updatedAt: new Date(row[JOURNAL_COLUMNS.UPDATED_AT]),
    }));

    console.log("[StorageService] Retrieved entries:", entries.length);
    return entries;
  } catch (error) {
    console.error("[StorageService] Error retrieving entries:", error);
    throw error;
  }
};

export const updateEntry = async (
  id: string,
  updates: Partial<Omit<JournalEntry, "id" | "createdAt" | "updatedAt">>
): Promise<void> => {
  try {
    const db = await ensureDbInitialized();
    const now = Date.now();
    const updateFields = Object.keys(updates)
      .map(key => `${JOURNAL_COLUMNS[key.toUpperCase() as keyof typeof JOURNAL_COLUMNS]} = ?`)
      .join(', ');
    
    const values = [...Object.values(updates), now, id];

    await db.runAsync(
      `UPDATE ${JOURNAL_TABLE} SET ${updateFields}, ${JOURNAL_COLUMNS.UPDATED_AT} = ? WHERE ${JOURNAL_COLUMNS.ID} = ?`,
      values
    );

    console.log("[StorageService] Entry updated successfully");
  } catch (error) {
    console.error("[StorageService] Error updating entry:", error);
    throw error;
  }
};

export const deleteEntry = async (id: string): Promise<void> => {
  try {
    const db = await ensureDbInitialized();
    await db.runAsync(
      `DELETE FROM ${JOURNAL_TABLE} WHERE ${JOURNAL_COLUMNS.ID} = ?`,
      [id]
    );

    console.log("[StorageService] Entry deleted successfully");
  } catch (error) {
    console.error("[StorageService] Error deleting entry:", error);
    throw error;
  }
};

export const getEntriesCount = async (): Promise<number> => {
  try {
    const db = await ensureDbInitialized();
    const result = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM ${JOURNAL_TABLE}`
    ) as { count: number } | undefined;
    
    return (result?.count as number) || 0;
  } catch (error) {
    console.error("[StorageService] Error getting entries count:", error);
    throw error;
  }
};

export const getEntriesByMood = async (mood: string): Promise<JournalEntry[]> => {
  try {
    const db = await ensureDbInitialized();
    const result = await db.getAllAsync(
      `SELECT * FROM ${JOURNAL_TABLE} WHERE ${JOURNAL_COLUMNS.MOOD} = ? ORDER BY ${JOURNAL_COLUMNS.CREATED_AT} DESC`,
      [mood]
    );

    const entries: JournalEntry[] = result.map((row: any) => ({
      id: row[JOURNAL_COLUMNS.ID],
      audioUri: row[JOURNAL_COLUMNS.AUDIO_URI],
      text: row[JOURNAL_COLUMNS.TEXT],
      mood: row[JOURNAL_COLUMNS.MOOD],
      duration: row[JOURNAL_COLUMNS.DURATION] || 0,
      createdAt: new Date(row[JOURNAL_COLUMNS.CREATED_AT]),
      updatedAt: new Date(row[JOURNAL_COLUMNS.UPDATED_AT]),
    }));

    console.log(`[StorageService] Retrieved ${entries.length} entries for mood: ${mood}`);
    return entries;
  } catch (error) {
    console.error("[StorageService] Error retrieving entries by mood:", error);
    throw error;
  }
};
