import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getTheme, ThemeTokens } from '../theme/tokens';
import { AppStateSnapshot, InspectionDraft } from '../types/domain';
import {
  loadLastSyncedAtFromDatabase,
  loadSnapshotFromDatabase,
  loadUnsyncedInspectionCountFromDatabase,
  loadUnsyncedInspectionEntriesFromDatabase,
  markInspectionEntriesAsSynced,
  saveInspectionDraftToDatabase,
  updateTaskStatusInDatabase,
} from '../storage/sqliteStorage';
import { syncInspectionEntriesToApi } from '../services/sync/syncService';
import {
  InspectionSubmitAction,
  emptyInspectionDraft,
  getTaskStatusForInspectionAction,
  updateTaskStatusForInspectionAction,
  upsertInspectionDraft,
} from '../utils/inspectionForm';

interface AssetGuardContextValue {
  ready: boolean;
  snapshot: AppStateSnapshot;
  lastSyncedAt: string | null;
  unsyncedInspectionCount: number;
  theme: ThemeTokens;
  saveInspectionDraft: (taskId: string, draft: InspectionDraft) => Promise<void>;
  submitInspectionDraft: (taskId: string, action: InspectionSubmitAction, draft: InspectionDraft) => Promise<void>;
  getInspectionDraft: (taskId: string) => InspectionDraft;
  syncPendingInspectionEntries: () => Promise<number>;
}

const AssetGuardContext = createContext<AssetGuardContextValue | undefined>(undefined);

export function AssetGuardProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [unsyncedInspectionCount, setUnsyncedInspectionCount] = useState(0);
  const [snapshot, setSnapshot] = useState<AppStateSnapshot>(() => ({
    tasks: [],
    inspectionDrafts: {},
  }));

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        // Load data snapshot from SQLite database on app startup to populate tasks page
        const [nextSnapshot, nextLastSyncedAt, nextUnsyncedInspectionCount] = await Promise.all([
          loadSnapshotFromDatabase(),
          loadLastSyncedAtFromDatabase(),
          loadUnsyncedInspectionCountFromDatabase(),
        ]);

        if (!active) {
          return;
        }

        setSnapshot(nextSnapshot);
        setLastSyncedAt(nextLastSyncedAt);
        setUnsyncedInspectionCount(nextUnsyncedInspectionCount);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const saveInspectionDraft = useCallback(async (taskId: string, draft: InspectionDraft) => {
    setSnapshot((current) => ({
      ...current,
      inspectionDrafts: upsertInspectionDraft(current.inspectionDrafts, taskId, draft),
    }));

    await saveInspectionDraftToDatabase(taskId, draft);
    setUnsyncedInspectionCount(await loadUnsyncedInspectionCountFromDatabase());
  }, []);

  const submitInspectionDraft = useCallback(async (taskId: string, action: InspectionSubmitAction, draft: InspectionDraft) => {
    const nextStatus = getTaskStatusForInspectionAction(action);

    setSnapshot((current) => ({
      ...current,
      tasks: updateTaskStatusForInspectionAction(current.tasks, taskId, action),
      inspectionDrafts: upsertInspectionDraft(current.inspectionDrafts, taskId, draft),
    }));

    await saveInspectionDraftToDatabase(taskId, draft);
    await updateTaskStatusInDatabase(taskId, nextStatus);
    setUnsyncedInspectionCount(await loadUnsyncedInspectionCountFromDatabase());
  }, []);

  const getInspectionDraft = useCallback((taskId: string): InspectionDraft => {
    return snapshot.inspectionDrafts[taskId] ?? emptyInspectionDraft;
  }, [snapshot.inspectionDrafts]);

  const syncPendingInspectionEntries = useCallback(async () => {
    const unsyncedEntries = await loadUnsyncedInspectionEntriesFromDatabase();

    if (unsyncedEntries.length === 0) {
      return 0;
    }

    await syncInspectionEntriesToApi(unsyncedEntries);
    await markInspectionEntriesAsSynced(unsyncedEntries.map((entry) => entry.draft.task_id));

    setLastSyncedAt(new Date().toISOString());
    setUnsyncedInspectionCount(await loadUnsyncedInspectionCountFromDatabase());

    return unsyncedEntries.length;
  }, []);

  const value = useMemo<AssetGuardContextValue>(() => {
    return {
      ready,
      snapshot,
      lastSyncedAt,
      unsyncedInspectionCount,
      theme: getTheme('light'),
      saveInspectionDraft,
      submitInspectionDraft,
      getInspectionDraft,
      syncPendingInspectionEntries,
    };
  }, [getInspectionDraft, lastSyncedAt, ready, saveInspectionDraft, snapshot, submitInspectionDraft, syncPendingInspectionEntries, unsyncedInspectionCount]);

  return <AssetGuardContext.Provider value={value}>{children}</AssetGuardContext.Provider>;
}

export function useAssetGuard() {
  const context = useContext(AssetGuardContext);

  if (!context) {
    throw new Error('useAssetGuard must be used within AssetGuardProvider.');
  }

  return context;
}

export function useSnapshotData() {
  const { snapshot } = useAssetGuard();

  return snapshot;
}
