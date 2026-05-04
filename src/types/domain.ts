export type TaskStatus = 'pending' | 'in-progress' | 'complete';
export type ThemeMode = 'light' | 'dark';

export interface AssetTask {
  id: string;
  assetId: string;
  assetName: string;
  siteName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  summary: string;
}

export interface AppStateSnapshot {
  tasks: AssetTask[];
}
