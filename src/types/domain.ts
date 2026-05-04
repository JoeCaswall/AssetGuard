export type TaskStatus = "pending" | "in-progress" | "complete";
export type ThemeMode = "light" | "dark";

export interface AssetTask {
  id: string;
  assetId: string;
  assetName: string;
  siteName: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: TaskStatus;
  summary: string;
}

export interface InspectionDraft {
  employeeNumber: string;
  condition: "pass" | "monitor" | "fail";
  notes: string;
  checklist: {
    safeIsolation: boolean;
    structuralIntegrity: boolean;
    leakCheck: boolean;
  };
}

export interface AppStateSnapshot {
  tasks: AssetTask[];
  inspectionDrafts: Record<string, InspectionDraft>;
}
