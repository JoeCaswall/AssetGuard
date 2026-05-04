import { AssetTask, InspectionDraft, TaskStatus } from '../types/domain';

export type InspectionCondition = 'pass' | 'monitor' | 'fail';

export interface InspectionChecklist {
  safeIsolation: boolean;
  structuralIntegrity: boolean;
  leakCheck: boolean;
}

export interface InspectionDraftInput {
  employeeNumber: string;
  condition: InspectionCondition;
  notes: string;
  checklist: InspectionChecklist;
}

export interface InspectionDraftSummary {
  employeeNumber: string;
  employeeNumberValid: boolean;
  condition: InspectionCondition;
  notesLength: number;
  checklistComplete: boolean;
}

export type InspectionSubmitAction = 'save-draft' | 'complete';

export const initialInspectionChecklist: InspectionChecklist = {
  safeIsolation: false,
  structuralIntegrity: false,
  leakCheck: false,
};

export const emptyInspectionDraft: InspectionDraft = {
  employeeNumber: '',
  condition: 'pass',
  notes: '',
  checklist: initialInspectionChecklist,
};

export function normaliseEmployeeNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

export function isValidEmployeeNumber(value: string): boolean {
  return /^\d{4}$/.test(normaliseEmployeeNumber(value));
}

export function isInspectionChecklistComplete(checklist: InspectionChecklist): boolean {
  return Object.values(checklist).every(Boolean);
}

export function buildInspectionDraftSummary(input: InspectionDraftInput): InspectionDraftSummary {
  const employeeNumber = normaliseEmployeeNumber(input.employeeNumber);

  return {
    employeeNumber,
    employeeNumberValid: isValidEmployeeNumber(employeeNumber),
    condition: input.condition,
    notesLength: input.notes.trim().length,
    checklistComplete: isInspectionChecklistComplete(input.checklist),
  };
}

export function upsertInspectionDraft(
  drafts: Record<string, InspectionDraft>,
  taskId: string,
  draft: InspectionDraft,
): Record<string, InspectionDraft> {
  return {
    ...drafts,
    [taskId]: {
      employeeNumber: normaliseEmployeeNumber(draft.employeeNumber),
      condition: draft.condition,
      notes: draft.notes,
      checklist: {
        ...draft.checklist,
      },
    },
  };
}

export function getTaskStatusForInspectionAction(action: InspectionSubmitAction): TaskStatus {
  return action === 'complete' ? 'complete' : 'in-progress';
}

export function updateTaskStatusForInspectionAction(
  tasks: AssetTask[],
  taskId: string,
  action: InspectionSubmitAction,
): AssetTask[] {
  const nextStatus = getTaskStatusForInspectionAction(action);

  return tasks.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task));
}