import * as SQLite from 'expo-sqlite';

import { seedTasks } from '../data/seed';
import { hasLocalDataExpired } from './retention';
import { AppStateSnapshot, InspectionDraft, TaskStatus } from '../types/domain';
import { DraftRow, TaskRow, draftToSqliteParams, rowToInspectionDraft, rowToTask } from './sqliteMappers';
import {
  decryptStorageNumber,
  decryptStorageValue,
  encryptStorageValue,
  isEncryptedStorageValue,
} from './storageCrypto';

/*
SQLite storage implementation and schema
This module manages the SQLite database connection, schema initialization, and provides functions to load and save data.
It seeds data from src/data/seed.ts for PoC purposes
*/

const DATABASE_NAME = 'assetguard.db';
const LOCAL_DATA_LAST_UPDATED_KEY = 'local_data_last_updated_at';

type StoredValue = string | number;

interface StoredTaskRow {
  id: string;
  asset_id: StoredValue;
  asset_name: StoredValue;
  site_name: StoredValue;
  due_date: StoredValue;
  priority: StoredValue;
  status: StoredValue;
  summary: StoredValue;
}

interface StoredDraftRow {
  task_id: string;
  employee_number: StoredValue;
  condition: StoredValue;
  notes: StoredValue;
  safe_isolation: StoredValue;
  structural_integrity: StoredValue;
  leak_check: StoredValue;
}

interface DatabaseTransaction {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, ...params: unknown[]): Promise<unknown>;
}

interface MetadataRow {
  value: string;
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<void> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

async function ensureDatabaseReady() {
  const db = await getDatabase();

  if (!initPromise) {
    initPromise = initialiseDatabase(db);
  }

  await initPromise;

  return db;
}

async function initialiseDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      asset_id TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      site_name TEXT NOT NULL,
      due_date TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      summary TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inspection_drafts (
      task_id TEXT PRIMARY KEY NOT NULL,
      employee_number TEXT NOT NULL,
      condition TEXT NOT NULL,
      notes TEXT NOT NULL,
      safe_isolation INTEGER NOT NULL,
      structural_integrity INTEGER NOT NULL,
      leak_check INTEGER NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  await purgeExpiredLocalDataIfNeeded(db);

  const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM tasks');

  if ((countRow?.count ?? 0) > 0) {
    await migratePlaintextRowsToEncrypted(db);
    await ensureLocalDataRetentionMarker(db);

    return;
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    await seedEncryptedTasks(txn);
    await updateLocalDataRetentionMarker(txn);
  });
}

async function getLocalDataLastUpdatedAt(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<MetadataRow>(
    'SELECT value FROM app_metadata WHERE key = $key',
    { $key: LOCAL_DATA_LAST_UPDATED_KEY },
  );

  return row?.value ?? null;
}

async function updateLocalDataRetentionMarker(target: DatabaseTransaction | SQLite.SQLiteDatabase, timestamp = new Date().toISOString()) {
  await target.runAsync(
    `INSERT INTO app_metadata (key, value)
     VALUES ($key, $value)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    {
      $key: LOCAL_DATA_LAST_UPDATED_KEY,
      $value: timestamp,
    },
  );
}

async function ensureLocalDataRetentionMarker(db: SQLite.SQLiteDatabase) {
  const lastUpdatedAt = await getLocalDataLastUpdatedAt(db);

  if (lastUpdatedAt) {
    return;
  }

  await updateLocalDataRetentionMarker(db);
}

async function purgeExpiredLocalDataIfNeeded(db: SQLite.SQLiteDatabase) {
  const lastUpdatedAt = await getLocalDataLastUpdatedAt(db);

  if (!lastUpdatedAt || !hasLocalDataExpired(lastUpdatedAt)) {
    return;
  }

  await resetDatabaseWithEncryptedSeedData(db);
}

async function seedEncryptedTasks(txn: DatabaseTransaction) {
  for (const task of seedTasks) {
    const encryptedTask = await encryptTaskForStorage(task);

    await txn.runAsync(
      `INSERT INTO tasks (id, asset_id, asset_name, site_name, due_date, priority, status, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      encryptedTask.id,
      encryptedTask.asset_id,
      encryptedTask.asset_name,
      encryptedTask.site_name,
      encryptedTask.due_date,
      encryptedTask.priority,
      encryptedTask.status,
      encryptedTask.summary,
    );
  }
}

async function resetDatabaseWithEncryptedSeedData(db: SQLite.SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync('DELETE FROM inspection_drafts; DELETE FROM tasks;');
    await seedEncryptedTasks(txn);
    await updateLocalDataRetentionMarker(txn);
  });
}

function valueNeedsEncryption(value: StoredValue) {
  return typeof value !== 'string' || !isEncryptedStorageValue(value);
}

async function encryptValueIfNeeded(value: StoredValue) {
  if (typeof value === 'string' && isEncryptedStorageValue(value)) {
    return value;
  }

  return encryptStorageValue(String(value));
}

async function decryptTaskRow(row: StoredTaskRow): Promise<TaskRow> {
  return {
    id: row.id,
    asset_id: await decryptStorageValue(row.asset_id),
    asset_name: await decryptStorageValue(row.asset_name),
    site_name: await decryptStorageValue(row.site_name),
    due_date: await decryptStorageValue(row.due_date),
    priority: (await decryptStorageValue(row.priority)) as TaskRow['priority'],
    status: (await decryptStorageValue(row.status)) as TaskRow['status'],
    summary: await decryptStorageValue(row.summary),
  };
}

async function decryptDraftRow(row: StoredDraftRow): Promise<DraftRow> {
  return {
    task_id: row.task_id,
    employee_number: await decryptStorageValue(row.employee_number),
    condition: (await decryptStorageValue(row.condition)) as DraftRow['condition'],
    notes: await decryptStorageValue(row.notes),
    safe_isolation: await decryptStorageNumber(row.safe_isolation),
    structural_integrity: await decryptStorageNumber(row.structural_integrity),
    leak_check: await decryptStorageNumber(row.leak_check),
  };
}

async function encryptTaskForStorage(task: {
  id: string;
  assetId: string;
  assetName: string;
  siteName: string;
  dueDate: string;
  priority: string;
  status: string;
  summary: string;
}) {
  return {
    id: task.id,
    asset_id: await encryptStorageValue(task.assetId),
    asset_name: await encryptStorageValue(task.assetName),
    site_name: await encryptStorageValue(task.siteName),
    due_date: await encryptStorageValue(task.dueDate),
    priority: await encryptStorageValue(task.priority),
    status: await encryptStorageValue(task.status),
    summary: await encryptStorageValue(task.summary),
  };
}

async function encryptDraftParams(taskId: string, draft: InspectionDraft) {
  const plaintextParams = draftToSqliteParams(taskId, draft);

  return {
    $taskId: plaintextParams.$taskId,
    $employeeNumber: await encryptStorageValue(plaintextParams.$employeeNumber),
    $condition: await encryptStorageValue(plaintextParams.$condition),
    $notes: await encryptStorageValue(plaintextParams.$notes),
    $safeIsolation: await encryptStorageValue(plaintextParams.$safeIsolation),
    $structuralIntegrity: await encryptStorageValue(plaintextParams.$structuralIntegrity),
    $leakCheck: await encryptStorageValue(plaintextParams.$leakCheck),
  };
}

function taskRowNeedsMigration(row: StoredTaskRow) {
  return [
    row.asset_id,
    row.asset_name,
    row.site_name,
    row.due_date,
    row.priority,
    row.status,
    row.summary,
  ].some(valueNeedsEncryption);
}

function draftRowNeedsMigration(row: StoredDraftRow) {
  return [
    row.employee_number,
    row.condition,
    row.notes,
    row.safe_isolation,
    row.structural_integrity,
    row.leak_check,
  ].some(valueNeedsEncryption);
}

async function migratePlaintextRowsToEncrypted(db: SQLite.SQLiteDatabase) {
  const taskRows = await db.getAllAsync<StoredTaskRow>(
    `SELECT id, asset_id, asset_name, site_name, due_date, priority, status, summary
     FROM tasks`,
  );
  const draftRows = await db.getAllAsync<StoredDraftRow>(
    `SELECT task_id, employee_number, condition, notes, safe_isolation, structural_integrity, leak_check
     FROM inspection_drafts`,
  );

  const tasksToMigrate = taskRows.filter(taskRowNeedsMigration);
  const draftsToMigrate = draftRows.filter(draftRowNeedsMigration);

  if (tasksToMigrate.length === 0 && draftsToMigrate.length === 0) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const row of tasksToMigrate) {
      await txn.runAsync(
        `UPDATE tasks
         SET asset_id = $assetId,
             asset_name = $assetName,
             site_name = $siteName,
             due_date = $dueDate,
             priority = $priority,
             status = $status,
             summary = $summary
         WHERE id = $id`,
        {
          $id: row.id,
          $assetId: await encryptValueIfNeeded(row.asset_id),
          $assetName: await encryptValueIfNeeded(row.asset_name),
          $siteName: await encryptValueIfNeeded(row.site_name),
          $dueDate: await encryptValueIfNeeded(row.due_date),
          $priority: await encryptValueIfNeeded(row.priority),
          $status: await encryptValueIfNeeded(row.status),
          $summary: await encryptValueIfNeeded(row.summary),
        },
      );
    }

    for (const row of draftsToMigrate) {
      await txn.runAsync(
        `UPDATE inspection_drafts
         SET employee_number = $employeeNumber,
             condition = $condition,
             notes = $notes,
             safe_isolation = $safeIsolation,
             structural_integrity = $structuralIntegrity,
             leak_check = $leakCheck
         WHERE task_id = $taskId`,
        {
          $taskId: row.task_id,
          $employeeNumber: await encryptValueIfNeeded(row.employee_number),
          $condition: await encryptValueIfNeeded(row.condition),
          $notes: await encryptValueIfNeeded(row.notes),
          $safeIsolation: await encryptValueIfNeeded(row.safe_isolation),
          $structuralIntegrity: await encryptValueIfNeeded(row.structural_integrity),
          $leakCheck: await encryptValueIfNeeded(row.leak_check),
        },
      );
    }
  });
}

export async function loadSnapshotFromDatabase(): Promise<AppStateSnapshot> {
  const db = await ensureDatabaseReady();
  const taskRows = await db.getAllAsync<StoredTaskRow>(
    `SELECT id, asset_id, asset_name, site_name, due_date, priority, status, summary
     FROM tasks
     ORDER BY id ASC`,
  );
  const draftRows = await db.getAllAsync<StoredDraftRow>(
    `SELECT task_id, employee_number, condition, notes, safe_isolation, structural_integrity, leak_check
     FROM inspection_drafts`,
  );

  
  try {
    const decryptedTaskRows = await Promise.all(taskRows.map(decryptTaskRow));
    const decryptedDraftRows = await Promise.all(draftRows.map(decryptDraftRow));

    return {
      tasks: decryptedTaskRows.map(rowToTask).sort((left, right) => left.dueDate.localeCompare(right.dueDate)),
      inspectionDrafts: Object.fromEntries(
        decryptedDraftRows.map((row) => [row.task_id, rowToInspectionDraft(row)]),
      ),
    };
    // This catch block is a safety net to handle any decryption failures which could occur if the encryption key changes or data becomes corrupted.
    // This is a fallback for PoC and must be updated with a proper migration strategy in a production app to avoid data loss.
    // TODO: Implement robust error handling and migration strategy for decryption failures to prevent data loss in production.
  } catch (error) {
    console.warn('Resetting local SQLite data after decryption failure.', error);
    // WIPES DATA FROM TASKS AND INSPECTION DRAFTS TABLES
    await resetDatabaseWithEncryptedSeedData(db);

    return {
      tasks: seedTasks,
      inspectionDrafts: {},
    };
  }
}

export async function saveInspectionDraftToDatabase(taskId: string, draft: InspectionDraft): Promise<void> {
  const db = await ensureDatabaseReady();
  const encryptedDraftParams = await encryptDraftParams(taskId, draft);

  await db.runAsync(
    `INSERT INTO inspection_drafts (
       task_id,
       employee_number,
       condition,
       notes,
       safe_isolation,
       structural_integrity,
       leak_check
     ) VALUES (
       $taskId,
       $employeeNumber,
       $condition,
       $notes,
       $safeIsolation,
       $structuralIntegrity,
       $leakCheck
     )
     ON CONFLICT(task_id) DO UPDATE SET
       employee_number = excluded.employee_number,
       condition = excluded.condition,
       notes = excluded.notes,
       safe_isolation = excluded.safe_isolation,
       structural_integrity = excluded.structural_integrity,
       leak_check = excluded.leak_check`,
    encryptedDraftParams,
  );

  await updateLocalDataRetentionMarker(db);
}

export async function updateTaskStatusInDatabase(taskId: string, status: TaskStatus): Promise<void> {
  const db = await ensureDatabaseReady();
  const encryptedStatus = await encryptStorageValue(status);

  await db.runAsync('UPDATE tasks SET status = $status WHERE id = $taskId', {
    $status: encryptedStatus,
    $taskId: taskId,
  });

  await updateLocalDataRetentionMarker(db);
}

export async function loadDatabaseDebugView() {
  const db = await ensureDatabaseReady();
  const tasks = await db.getAllAsync<StoredTaskRow>(
    `SELECT id, asset_id, asset_name, site_name, due_date, priority, status, summary
     FROM tasks
     ORDER BY id ASC`,
  );
  const inspectionDrafts = await db.getAllAsync<StoredDraftRow>(
    `SELECT task_id, employee_number, condition, notes, safe_isolation, structural_integrity, leak_check
     FROM inspection_drafts
     ORDER BY task_id ASC`,
  );

  return {
    databaseName: DATABASE_NAME,
    tasks,
    inspectionDrafts,
  };
}