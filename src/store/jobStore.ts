import { create } from 'zustand';
import { InspectionJob, SyncStatus } from '@types/index';
import { JobRepository } from '@database/JobRepository';

interface JobStore {
  // State
  jobs: InspectionJob[];
  selectedJob: InspectionJob | null;
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus;

  // Actions
  loadJobs: () => Promise<void>;
  loadJobById: (jobId: string) => Promise<void>;
  createJob: (jobData: Omit<InspectionJob, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (jobId: string, updates: Partial<InspectionJob>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  completeJob: (jobId: string, notes?: string) => Promise<void>;
  clearError: () => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  resetSyncStatus: () => void;
}

const initialSyncStatus: SyncStatus = {
  isSyncing: false,
  lastSyncTime: undefined,
  pendingChanges: 0,
  error: undefined,
};

export const useJobStore = create<JobStore>((set, get) => ({
  // Initial state
  jobs: [],
  selectedJob: null,
  loading: false,
  error: null,
  syncStatus: initialSyncStatus,

  // Load all jobs
  loadJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await JobRepository.getAllJobs();
      set({ jobs, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Load single job
  loadJobById: async (jobId: string) => {
    set({ loading: true, error: null });
    try {
      const job = await JobRepository.getJobById(jobId);
      set({ selectedJob: job, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load job';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Create job
  createJob: async (jobData) => {
    set({ loading: true, error: null });
    try {
      const newJob = await JobRepository.createJob(jobData);
      const currentJobs = get().jobs;
      set({ jobs: [...currentJobs, newJob].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Update job
  updateJob: async (jobId: string, updates: Partial<InspectionJob>) => {
    set({ loading: true, error: null });
    try {
      const updated = await JobRepository.updateJob(jobId, updates);
      const currentJobs = get().jobs;
      const updatedJobs = currentJobs.map(job => (job.id === jobId ? updated : job));
      set({ jobs: updatedJobs, selectedJob: updated, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete job
  deleteJob: async (jobId: string) => {
    set({ loading: true, error: null });
    try {
      await JobRepository.deleteJob(jobId);
      const currentJobs = get().jobs;
      set({ jobs: currentJobs.filter(job => job.id !== jobId), selectedJob: null, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete job';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Complete job
  completeJob: async (jobId: string, notes?: string) => {
    set({ loading: true, error: null });
    try {
      const updated = await JobRepository.completeJob(jobId, notes);
      const currentJobs = get().jobs;
      const updatedJobs = currentJobs.map(job => (job.id === jobId ? updated : job));
      set({ jobs: updatedJobs, selectedJob: updated, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete job';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set sync status
  setSyncStatus: (status: Partial<SyncStatus>) => {
    const current = get().syncStatus;
    set({ syncStatus: { ...current, ...status } });
  },

  // Reset sync status
  resetSyncStatus: () => {
    set({ syncStatus: initialSyncStatus });
  },
}));
