import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { seedTasks } from '../data/seed';
import { getTheme, ThemeTokens } from '../theme/tokens';
import { AppStateSnapshot } from '../types/domain';

interface AssetGuardContextValue {
  snapshot: AppStateSnapshot;
  theme: ThemeTokens;
}

const AssetGuardContext = createContext<AssetGuardContextValue | undefined>(undefined);

export function AssetGuardProvider({ children }: PropsWithChildren) {
  const snapshot = useMemo<AppStateSnapshot>(() => ({
    tasks: seedTasks,
  }), []);

  const value = useMemo<AssetGuardContextValue>(() => {
    return {
      snapshot,
      theme: getTheme('light'),
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
