import {
  buildInspectionDraftSummary,
  emptyInspectionDraft,
  getTaskStatusForInspectionAction,
  initialInspectionChecklist,
  isInspectionChecklistComplete,
  normaliseEngineerInitials,
  updateTaskStatusForInspectionAction,
  upsertInspectionDraft,
} from '../src/utils/inspectionForm';

describe('inspection form helpers', () => {
  it('normalises engineer initials to trimmed uppercase text', () => {
    expect(normaliseEngineerInitials(' jc ')).toBe('JC');
  });

  it('returns a placeholder when initials are empty', () => {
    expect(normaliseEngineerInitials('   ')).toBe('Not set');
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
        engineerInitials: 'ab',
        condition: 'monitor',
        notes: '  follow up required  ',
        checklist: {
          safeIsolation: true,
          structuralIntegrity: true,
          leakCheck: false,
        },
      }),
    ).toEqual({
      engineerInitials: 'AB',
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
          engineerInitials: 'jc',
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
        engineerInitials: 'jc',
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