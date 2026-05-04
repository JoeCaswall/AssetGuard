import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { seedTasks } from '../data/seed';
import { getTheme, ThemeTokens } from '../theme/tokens';
import { AppStateSnapshot, InspectionDraft } from '../types/domain';
import {
  InspectionSubmitAction,
  emptyInspectionDraft,
  updateTaskStatusForInspectionAction,
  upsertInspectionDraft,
} from '../utils/inspectionForm';

interface AssetGuardContextValue {
  snapshot: AppStateSnapshot;
  theme: ThemeTokens;
  saveInspectionDraft: (taskId: string, draft: InspectionDraft) => void;
  submitInspectionDraft: (taskId: string, action: InspectionSubmitAction, draft: InspectionDraft) => void;
  getInspectionDraft: (taskId: string) => InspectionDraft;
}

const AssetGuardContext = createContext<AssetGuardContextValue | undefined>(undefined);

export function AssetGuardProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<AppStateSnapshot>(() => ({
    tasks: seedTasks,
    inspectionDrafts: {},
  }));

  const saveInspectionDraft = useCallback((taskId: string, draft: InspectionDraft) => {
    setSnapshot((current) => ({
      ...current,
      inspectionDrafts: upsertInspectionDraft(current.inspectionDrafts, taskId, draft),
    }));
  }, []);

  const submitInspectionDraft = useCallback((taskId: string, action: InspectionSubmitAction, draft: InspectionDraft) => {
    setSnapshot((current) => ({
      ...current,
      tasks: updateTaskStatusForInspectionAction(current.tasks, taskId, action),
      inspectionDrafts: upsertInspectionDraft(current.inspectionDrafts, taskId, draft),
    }));
  }, []);

  const getInspectionDraft = useCallback((taskId: string): InspectionDraft => {
    return snapshot.inspectionDrafts[taskId] ?? emptyInspectionDraft;
  }, [snapshot.inspectionDrafts]);

  const value = useMemo<AssetGuardContextValue>(() => {
    return {
      snapshot,
      theme: getTheme('light'),
      saveInspectionDraft,
      submitInspectionDraft,
      getInspectionDraft,
    };
  }, [snapshot]);

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
