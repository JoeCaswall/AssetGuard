/**
 * Core types and interfaces for the AssetGuard application
 */

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  status: JobStatus;
  priority: Priority;
  engineerId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  photos?: Photo[];
  notes?: string;
}

export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Photo {
  id: string;
  jobId: string;
  uri: string;
  timestamp: Date;
  caption?: string;
}

export interface Engineer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncStatus {
  lastSyncTime?: Date;
  isSyncing: boolean;
  hasUnsyncedData: boolean;
  syncErrors: string[];
}

export interface AppState {
  jobs: Job[];
  currentEngineer?: Engineer;
  syncStatus: SyncStatus;
  loading: boolean;
  error?: string;
}

// Navigation parameter types
export type RootStackParamList = {
  Jobs: undefined;
  JobDetail: { jobId: string };
  CreateJob: undefined;
  Settings: undefined;
};

export type JobsStackParamList = {
  JobsList: undefined;
  JobDetail: { jobId: string };
  CreateJob: undefined;
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
};

export type BottomTabParamList = {
  JobsStack: undefined;
  SettingsStack: undefined;
};
