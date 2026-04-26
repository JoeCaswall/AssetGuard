/* Job Status */
export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

/* Inspection Job */
export interface InspectionJob {
  id: string;
  title: string;
  description: string;
  location: string;
  status: JobStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string; // ISO 8601 format
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  completedAt?: string; // ISO 8601 format
  imageUris?: string[];
  notes?: string;
}

/* Job with computed fields */
export interface JobWithComputed extends InspectionJob {
  isOverdue: boolean;
  daysUntilDue: number;
}

/* Navigation Types */
export type RootStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  CreateJob: undefined;
  EditJob: { jobId: string };
  SyncStatus: undefined;
};

export type BottomTabParamList = {
  JobsTab: undefined;
  CreateJobTab: undefined;
  SettingsTab: undefined;
};

/* Sync Status */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: string;
  pendingChanges: number;
  error?: string;
}

/* API Response */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/* Form Data */
export interface CreateJobFormData {
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}
