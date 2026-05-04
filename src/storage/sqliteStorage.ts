import * as SQLite from 'expo-sqlite';

import { seedTasks } from '../data/seed';
import { AppStateSnapshot, InspectionDraft, TaskStatus } from '../types/domain';
import { DraftRow, TaskRow, draftToSqliteParams, rowToInspectionDraft, rowToTask } from './sqliteMappers';

/*
SQLite storage implementation and schema
This module manages the SQLite database connection, schema initialization, and provides functions to load and save data.
It seeds data from src/data/seed.ts for PoC purposes

*/

const DATABASE_NAME = 'assetguard.db';

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

  const countRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM tasks');

  if ((countRow?.count ?? 0) > 0) {
    return;
  }

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const task of seedTasks) {
      await txn.runAsync(
        `INSERT INTO tasks (id, asset_id, asset_name, site_name, due_date, priority, status, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        task.id,
        task.assetId,
        task.assetName,
        task.siteName,
        task.dueDate,
        task.priority,
        task.status,
        task.summary,
      );
    }
  });
}

export async function loadSnapshotFromDatabase(): Promise<AppStateSnapshot> {
  const db = await ensureDatabaseReady();
  const taskRows = await db.getAllAsync<TaskRow>(
    `SELECT id, asset_id, asset_name, site_name, due_date, priority, status, summary
     FROM tasks
     ORDER BY due_date ASC`,
  );
  const draftRows = await db.getAllAsync<DraftRow>(
    `SELECT task_id, employee_number, condition, notes, safe_isolation, structural_integrity, leak_check
     FROM inspection_drafts`,
  );

  return {
    tasks: taskRows.map(rowToTask),
    inspectionDrafts: Object.fromEntries(
      draftRows.map((row) => [row.task_id, rowToInspectionDraft(row)]),
    ),
  };
}

export async function saveInspectionDraftToDatabase(taskId: string, draft: InspectionDraft): Promise<void> {
  const db = await ensureDatabaseReady();

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
    draftToSqliteParams(taskId, draft),
  );
}

export async function updateTaskStatusInDatabase(taskId: string, status: TaskStatus): Promise<void> {
  const db = await ensureDatabaseReady();

  await db.runAsync('UPDATE tasks SET status = $status WHERE id = $taskId', {
    $status: status,
    $taskId: taskId,
  });
}