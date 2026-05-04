import React from 'react';

const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

import { AssetGuardProvider, useAssetGuard } from '../src/context/AssetGuardProvider';
import type { SyncInspectionEntry } from '../src/storage/sqliteStorage';

const mockLoadSnapshotFromDatabase = jest.fn();
const mockLoadUnsyncedInspectionEntriesFromDatabase = jest.fn();
const mockMarkInspectionEntriesAsSynced = jest.fn();
const mockSaveInspectionDraftToDatabase = jest.fn();
const mockUpdateTaskStatusInDatabase = jest.fn();
const mockSyncInspectionEntriesToApi = jest.fn();

jest.mock('../src/storage/sqliteStorage', () => ({
  loadSnapshotFromDatabase: (...args: unknown[]) => mockLoadSnapshotFromDatabase(...args),
  loadUnsyncedInspectionEntriesFromDatabase: (...args: unknown[]) => mockLoadUnsyncedInspectionEntriesFromDatabase(...args),
  markInspectionEntriesAsSynced: (...args: unknown[]) => mockMarkInspectionEntriesAsSynced(...args),
  saveInspectionDraftToDatabase: (...args: unknown[]) => mockSaveInspectionDraftToDatabase(...args),
  updateTaskStatusInDatabase: (...args: unknown[]) => mockUpdateTaskStatusInDatabase(...args),
}));

jest.mock('../src/services/sync/syncService', () => ({
  syncInspectionEntriesToApi: (...args: unknown[]) => mockSyncInspectionEntriesToApi(...args),
}));

describe('AssetGuardProvider sync flow', () => {
  const entries: SyncInspectionEntry[] = [
    {
      task: {
        id: 'task-1',
        asset_id: 'enc:v1:asset-id',
        asset_name: 'enc:v1:asset-name',
        site_name: 'enc:v1:site-name',
        due_date: 'enc:v1:due-date',
        priority: 'enc:v1:priority',
        status: 'enc:v1:status',
        summary: 'enc:v1:summary',
      },
      draft: {
        task_id: 'task-1',
        employee_number: 'enc:v1:employee-number',
        condition: 'enc:v1:condition',
        notes: 'enc:v1:notes',
        safe_isolation: 'enc:v1:safe-isolation',
        structural_integrity: 'enc:v1:structural-integrity',
        leak_check: 'enc:v1:leak-check',
        is_synced: 0,
      },
    },
  ];

  let capturedContext: ReturnType<typeof useAssetGuard> | undefined;

  function ContextProbe() {
    capturedContext = useAssetGuard();

    return null;
  }

  async function renderProvider() {
    await act(async () => {
      TestRenderer.create(
        React.createElement(
          AssetGuardProvider,
          null,
          React.createElement(ContextProbe),
        ),
      );
    });
  }

  beforeEach(() => {
    capturedContext = undefined;
    mockLoadSnapshotFromDatabase.mockReset();
    mockLoadUnsyncedInspectionEntriesFromDatabase.mockReset();
    mockMarkInspectionEntriesAsSynced.mockReset();
    mockSaveInspectionDraftToDatabase.mockReset();
    mockUpdateTaskStatusInDatabase.mockReset();
    mockSyncInspectionEntriesToApi.mockReset();

    mockLoadSnapshotFromDatabase.mockResolvedValue({
      tasks: [],
      inspectionDrafts: {},
    });
  });

  it('marks unsynced rows as synced only after a successful API sync', async () => {
    mockLoadUnsyncedInspectionEntriesFromDatabase.mockResolvedValue(entries);
    mockSyncInspectionEntriesToApi.mockResolvedValue(undefined);
    mockMarkInspectionEntriesAsSynced.mockResolvedValue(undefined);

    await renderProvider();

    let syncedCount = 0;

    await act(async () => {
      syncedCount = await capturedContext!.syncPendingInspectionEntries();
    });

    expect(mockSyncInspectionEntriesToApi).toHaveBeenCalledWith(entries);
    expect(mockMarkInspectionEntriesAsSynced).toHaveBeenCalledWith(['task-1']);
    expect(mockSyncInspectionEntriesToApi.mock.invocationCallOrder[0]!).toBeLessThan(
      mockMarkInspectionEntriesAsSynced.mock.invocationCallOrder[0]!,
    );
    expect(syncedCount).toBe(1);
  });

  it('does not mark rows as synced when the API sync fails', async () => {
    mockLoadUnsyncedInspectionEntriesFromDatabase.mockResolvedValue(entries);
    mockSyncInspectionEntriesToApi.mockRejectedValue(new Error('Mock sync failed.'));

    await renderProvider();

    await expect(capturedContext!.syncPendingInspectionEntries()).rejects.toThrow('Mock sync failed.');
    expect(mockMarkInspectionEntriesAsSynced).not.toHaveBeenCalled();
  });
});