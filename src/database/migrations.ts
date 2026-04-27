/**
 * Database schema and migration definitions
 */

export const SCHEMA_VERSION = 1;

export const schema = {
  jobs: `
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      engineerId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      completedAt INTEGER,
      notes TEXT,
      synced INTEGER DEFAULT 0,
      syncedAt INTEGER
    )
  `,
  photos: `
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      uri TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      caption TEXT,
      FOREIGN KEY (jobId) REFERENCES jobs(id)
    )
  `,
  engineers: `
    CREATE TABLE IF NOT EXISTS engineers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `,
  syncQueue: `
    CREATE TABLE IF NOT EXISTS syncQueue (
      id TEXT PRIMARY KEY,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      retryCount INTEGER DEFAULT 0
    )
  `,
};

export const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_jobs_engineerId ON jobs(engineerId);
  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_synced ON jobs(synced);
  CREATE INDEX IF NOT EXISTS idx_photos_jobId ON photos(jobId);
  CREATE INDEX IF NOT EXISTS idx_syncQueue_entityType ON syncQueue(entityType);
`;
