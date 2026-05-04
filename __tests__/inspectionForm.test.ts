import {
  buildInspectionDraftSummary,
  emptyInspectionDraft,
  getTaskStatusForInspectionAction,
  initialInspectionChecklist,
  isInspectionChecklistComplete,
  isValidEmployeeNumber,
  normaliseEmployeeNumber,
  updateTaskStatusForInspectionAction,
  upsertInspectionDraft,
} from '../src/utils/inspectionForm';

describe('inspection form helpers', () => {
  it('normalises employee numbers to digits only with a four-digit maximum', () => {
    expect(normaliseEmployeeNumber(' 12a34 56 ')).toBe('1234');
  });

  it('accepts only valid four-digit employee numbers', () => {
    expect(isValidEmployeeNumber('1234')).toBe(true);
    expect(isValidEmployeeNumber('123')).toBe(false);
    expect(isValidEmployeeNumber('12a4')).toBe(false);
  });

  it('treats the checklist as incomplete until every item is true', () => {
    expect(isInspectionChecklistComplete(initialInspectionChecklist)).toBe(false);
    expect(
      isInspectionChecklistComplete({
        safeIsolation: true,
        structuralIntegrity: true,
        leakCheck: true,
      }),
    ).toBe(true);
  });

  it('builds a draft summary with trimmed notes length and checklist state', () => {
    expect(
      buildInspectionDraftSummary({
        employeeNumber: '12a45',
        condition: 'monitor',
        notes: '  follow up required  ',
        checklist: {
          safeIsolation: true,
          structuralIntegrity: true,
          leakCheck: false,
        },
      }),
    ).toEqual({
      employeeNumber: '1245',
      employeeNumberValid: true,
      condition: 'monitor',
      notesLength: 18,
      checklistComplete: false,
    });
  });

  it('stores drafts by task id without mutating other saved drafts', () => {
    expect(
      upsertInspectionDraft(
        {
          'task-1': {
            ...emptyInspectionDraft,
            notes: 'existing',
          },
        },
        'task-2',
        {
          employeeNumber: '12a4',
          condition: 'pass',
          notes: 'new draft',
          checklist: {
            safeIsolation: true,
            structuralIntegrity: false,
            leakCheck: false,
          },
        },
      ),
    ).toEqual({
      'task-1': {
        ...emptyInspectionDraft,
        notes: 'existing',
      },
      'task-2': {
        employeeNumber: '124',
        condition: 'pass',
        notes: 'new draft',
        checklist: {
          safeIsolation: true,
          structuralIntegrity: false,
          leakCheck: false,
        },
      },
    });
  });

  it('maps inspection actions to the expected task status', () => {
    expect(getTaskStatusForInspectionAction('save-draft')).toBe('in-progress');
    expect(getTaskStatusForInspectionAction('complete')).toBe('complete');
  });

  it('updates only the selected task status when an inspection is submitted', () => {
    expect(
      updateTaskStatusForInspectionAction(
        [
          {
            id: 'task-1',
            assetId: 'asset-1',
            assetName: 'Asset 1',
            siteName: 'Site 1',
            dueDate: '2026-05-04T10:00:00.000Z',
            priority: 'high',
            status: 'pending',
            summary: 'Summary 1',
          },
          {
            id: 'task-2',
            assetId: 'asset-2',
            assetName: 'Asset 2',
            siteName: 'Site 2',
            dueDate: '2026-05-05T10:00:00.000Z',
            priority: 'low',
            status: 'pending',
            summary: 'Summary 2',
          },
        ],
        'task-1',
        'complete',
      ),
    ).toEqual([
      {
        id: 'task-1',
        assetId: 'asset-1',
        assetName: 'Asset 1',
        siteName: 'Site 1',
        dueDate: '2026-05-04T10:00:00.000Z',
        priority: 'high',
        status: 'complete',
        summary: 'Summary 1',
      },
      {
        id: 'task-2',
        assetId: 'asset-2',
        assetName: 'Asset 2',
        siteName: 'Site 2',
        dueDate: '2026-05-05T10:00:00.000Z',
        priority: 'low',
        status: 'pending',
        summary: 'Summary 2',
      },
    ]);
  });
});