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
  loadSnapshotFromDatabase,
  saveInspectionDraftToDatabase,
  updateTaskStatusInDatabase,
} from '../storage/sqliteStorage';
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
  theme: ThemeTokens;
  saveInspectionDraft: (taskId: string, draft: InspectionDraft) => Promise<void>;
  submitInspectionDraft: (taskId: string, action: InspectionSubmitAction, draft: InspectionDraft) => Promise<void>;
  getInspectionDraft: (taskId: string) => InspectionDraft;
}

const AssetGuardContext = createContext<AssetGuardContextValue | undefined>(undefined);

export function AssetGuardProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<AppStateSnapshot>(() => ({
    tasks: [],
    inspectionDrafts: {},
  }));

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        // Load data snapshot from SQLite database on app startup to populate tasks page
        const nextSnapshot = await loadSnapshotFromDatabase();

        if (!active) {
          return;
        }

        setSnapshot(nextSnapshot);
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
  }, []);

  const getInspectionDraft = useCallback((taskId: string): InspectionDraft => {
    return snapshot.inspectionDrafts[taskId] ?? emptyInspectionDraft;
  }, [snapshot.inspectionDrafts]);

  const value = useMemo<AssetGuardContextValue>(() => {
    return {
      ready,
      snapshot,
      theme: getTheme('light'),
      saveInspectionDraft,
      submitInspectionDraft,
      getInspectionDraft,
    };
  }, [getInspectionDraft, ready, saveInspectionDraft, snapshot, submitInspectionDraft]);

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
