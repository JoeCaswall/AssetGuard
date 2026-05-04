import { draftToSqliteParams, rowToInspectionDraft, rowToTask } from '../src/storage/sqliteMappers';

describe('sqlite storage mappers', () => {
  it('maps task rows into domain tasks', () => {
    expect(
      rowToTask({
        id: 'task-1',
        asset_id: 'asset-1',
        asset_name: 'Transformer',
        site_name: 'North site',
        due_date: '2026-05-04T10:00:00.000Z',
        priority: 'high',
        status: 'pending',
        summary: 'Inspect enclosure',
      }),
    ).toEqual({
      id: 'task-1',
      assetId: 'asset-1',
      assetName: 'Transformer',
      siteName: 'North site',
      dueDate: '2026-05-04T10:00:00.000Z',
      priority: 'high',
      status: 'pending',
      summary: 'Inspect enclosure',
    });
  });

  it('maps draft rows into domain drafts with boolean checklist values', () => {
    expect(
      rowToInspectionDraft({
        task_id: 'task-1',
        employee_number: '1234',
        condition: 'monitor',
        notes: 'Needs review',
        safe_isolation: 1,
        structural_integrity: 0,
        leak_check: 1,
      }),
    ).toEqual({
      employeeNumber: '1234',
      condition: 'monitor',
      notes: 'Needs review',
      checklist: {
        safeIsolation: true,
        structuralIntegrity: false,
        leakCheck: true,
      },
    });
  });

  it('converts drafts into sqlite bind parameters', () => {
    expect(
      draftToSqliteParams('task-1', {
        employeeNumber: '1234',
        condition: 'pass',
        notes: 'All good',
        checklist: {
          safeIsolation: true,
          structuralIntegrity: true,
          leakCheck: false,
        },
      }),
    ).toEqual({
      $taskId: 'task-1',
      $employeeNumber: '1234',
      $condition: 'pass',
      $notes: 'All good',
      $safeIsolation: 1,
      $structuralIntegrity: 1,
      $leakCheck: 0,
    });
  });
});