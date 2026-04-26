import SQLite from 'react-native-sqlite-storage';
import { InspectionJob } from '@types/index';

// Enable promises
SQLite.enablePromise(true);

const DATABASE_NAME = 'assetguard.db';
const DATABASE_VERSION = 1;

interface DBInstance {
  db: SQLite.SQLiteDatabase | null;
}

const dbInstance: DBInstance = {
  db: null,
};

/**
 * Initialize the database connection and create tables
 */
export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });

    dbInstance.db = db;

    // Create tables
    await createTables(db);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Create necessary database tables
 */
const createTables = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  try {
    // Jobs table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT NOT NULL DEFAULT 'medium',
        assignedTo TEXT,
        dueDate TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        completedAt TEXT,
        notes TEXT,
        syncStatus TEXT DEFAULT 'pending',
        lastSyncTime TEXT
      )
    `);

    // Job attachments table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS job_attachments (
        id TEXT PRIMARY KEY,
        jobId TEXT NOT NULL,
        imageUri TEXT NOT NULL,
        uploadedAt TEXT NOT NULL,
        syncStatus TEXT DEFAULT 'pending',
        FOREIGN KEY(jobId) REFERENCES jobs(id) ON DELETE CASCADE
      )
    `);

    // Sync queue table for tracking changes
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        payload TEXT,
        createdAt TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      )
    `);

    // Create indexes for better query performance
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)');
    await db.executeSql('CREATE INDEX IF NOT EXISTS idx_jobs_dueDate ON jobs(dueDate)');
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_job_attachments_jobId ON job_attachments(jobId)'
    );

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!dbInstance.db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return dbInstance.db;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (dbInstance.db) {
    try {
      await dbInstance.db.close();
      dbInstance.db = null;
      console.log('Database closed');
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
};

/**
 * Clear all data (for development/testing)
 */
export const clearDatabase = async (): Promise<void> => {
  const db = getDatabase();
  try {
    await db.executeSql('DELETE FROM job_attachments');
    await db.executeSql('DELETE FROM jobs');
    await db.executeSql('DELETE FROM sync_queue');
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};
