import { AssetTask, InspectionDraft } from '../types/domain';

/*
Translation layer between SQLite rows and domain models to match app camelCase to SQL snake_case
as well as handling boolean to integer conversions for SQLite storage, and mapping table rows to 
InspectionDrafts and AssetTasks.
*/

export interface TaskRow {
  id: string;
  asset_id: string;
  asset_name: string;
  site_name: string;
  due_date: string;
  priority: AssetTask['priority'];
  status: AssetTask['status'];
  summary: string;
}

export interface DraftRow {
  task_id: string;
  employee_number: string;
  condition: InspectionDraft['condition'];
  notes: string;
  safe_isolation: number;
  structural_integrity: number;
  leak_check: number;
  is_synced: number;
}

export function rowToTask(row: TaskRow): AssetTask {
  return {
    id: row.id,
    assetId: row.asset_id,
    assetName: row.asset_name,
    siteName: row.site_name,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    summary: row.summary,
  };
}

export function rowToInspectionDraft(row: DraftRow): InspectionDraft {
  return {
    employeeNumber: row.employee_number,
    condition: row.condition,
    notes: row.notes,
    checklist: {
      safeIsolation: Boolean(row.safe_isolation),
      structuralIntegrity: Boolean(row.structural_integrity),
      leakCheck: Boolean(row.leak_check),
    },
  };
}

export function draftToSqliteParams(taskId: string, draft: InspectionDraft) {
  return {
    $taskId: taskId,
    $employeeNumber: draft.employeeNumber,
    $condition: draft.condition,
    $notes: draft.notes,
    $safeIsolation: draft.checklist.safeIsolation ? 1 : 0,
    $structuralIntegrity: draft.checklist.structuralIntegrity ? 1 : 0,
    $leakCheck: draft.checklist.leakCheck ? 1 : 0,
    $isSynced: 0,
  };
}