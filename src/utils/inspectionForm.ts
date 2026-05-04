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

export const initialInspectionChecklist: InspectionChecklist = {
  safeIsolation: false,
  structuralIntegrity: false,
  leakCheck: false,
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