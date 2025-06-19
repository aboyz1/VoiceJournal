// Database table and column names
export const JOURNAL_TABLE = 'journal_entries';

export const JOURNAL_COLUMNS = {
  ID: 'id',
  AUDIO_URI: 'audio_uri',
  TEXT: 'text',
  MOOD: 'mood',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

// Journal entry interface
export interface JournalEntry {
  id: string;
  audioUri: string;
  text: string;
  mood: string;
  createdAt: Date;
  updatedAt: Date;
}

// SQL statements for table creation
export const CREATE_JOURNAL_TABLE = `
  CREATE TABLE IF NOT EXISTS ${JOURNAL_TABLE} (
    ${JOURNAL_COLUMNS.ID} TEXT PRIMARY KEY,
    ${JOURNAL_COLUMNS.AUDIO_URI} TEXT NOT NULL,
    ${JOURNAL_COLUMNS.TEXT} TEXT NOT NULL,
    ${JOURNAL_COLUMNS.MOOD} TEXT NOT NULL,
    ${JOURNAL_COLUMNS.CREATED_AT} INTEGER NOT NULL,
    ${JOURNAL_COLUMNS.UPDATED_AT} INTEGER NOT NULL
  )
`;

export const CREATE_TEXT_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_journal_text 
  ON ${JOURNAL_TABLE}(${JOURNAL_COLUMNS.TEXT})
`;

export const CREATE_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_journal_date 
  ON ${JOURNAL_TABLE}(${JOURNAL_COLUMNS.CREATED_AT})
`;

// NLP Analysis interface
export interface NLPAnalysis {
  mood: string;
  confidence: number;
  keywords: string[];
  summary: string;
  sentimentScore: number;
}
