import { useJobStore } from '@store/jobStore';
import { InspectionJob, JobStatus } from '@types/index';
import { getDaysUntilDue, isOverdue as isJobOverdue } from '@utils/dateUtils';

/**
 * Custom hook for job operations with computed properties
 */
export const useJobs = () => {
  const store = useJobStore();

  /**
   * Get jobs with computed properties
   */
  const getJobsWithComputed = () => {
    return store.jobs.map((job) => ({
      ...job,
      isOverdue: isJobOverdue(job.dueDate),
      daysUntilDue: getDaysUntilDue(job.dueDate),
    }));
  };

  /**
   * Get jobs filtered by status
   */
  const getJobsByStatus = (status: JobStatus) => {
    return store.jobs.filter((job) => job.status === status);
  };

  /**
   * Get overdue jobs
   */
  const getOverdueJobs = () => {
    return store.jobs.filter((job) => isJobOverdue(job.dueDate) && job.status !== 'completed');
  };

  /**
   * Get jobs due soon (within 3 days)
   */
  const getUrgentJobs = () => {
    return store.jobs.filter((job) => {
      const daysUntil = getDaysUntilDue(job.dueDate);
      return daysUntil >= 0 && daysUntil <= 3 && job.status !== 'completed';
    });
  };

  /**
   * Get job statistics
   */
  const getStatistics = () => {
    return {
      total: store.jobs.length,
      pending: store.jobs.filter((j) => j.status === 'pending').length,
      inProgress: store.jobs.filter((j) => j.status === 'in-progress').length,
      completed: store.jobs.filter((j) => j.status === 'completed').length,
      overdue: getOverdueJobs().length,
      urgent: getUrgentJobs().length,
    };
  };

  return {
    ...store,
    getJobsWithComputed,
    getJobsByStatus,
    getOverdueJobs,
    getUrgentJobs,
    getStatistics,
  };
};
