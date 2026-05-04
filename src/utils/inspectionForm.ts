import { AssetTask, InspectionDraft, TaskStatus } from '../types/domain';

export type InspectionCondition = 'pass' | 'monitor' | 'fail';

export interface InspectionChecklist {
  safeIsolation: boolean;
  structuralIntegrity: boolean;
  leakCheck: boolean;
}

export interface InspectionDraftInput {
  engineerInitials: string;
  condition: InspectionCondition;
  notes: string;
  checklist: InspectionChecklist;
}

export interface InspectionDraftSummary {
  engineerInitials: string;
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
  engineerInitials: '',
  condition: 'pass',
  notes: '',
  checklist: initialInspectionChecklist,
};

export function normaliseEngineerInitials(value: string): string {
  const trimmed = value.trim().toUpperCase();

  return trimmed || 'Not set';
}

export function isInspectionChecklistComplete(checklist: InspectionChecklist): boolean {
  return Object.values(checklist).every(Boolean);
}

export function buildInspectionDraftSummary(input: InspectionDraftInput): InspectionDraftSummary {
  return {
    engineerInitials: normaliseEngineerInitials(input.engineerInitials),
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
      engineerInitials: draft.engineerInitials,
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