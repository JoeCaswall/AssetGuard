import { getDatabase } from './init';
import { InspectionJob, JobStatus } from '@types/index';
import { v4 as uuidv4 } from 'uuid';

/**
 * Job repository for database operations
 */
export class JobRepository {
  /**
   * Create a new job
   */
  static async createJob(jobData: Omit<InspectionJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<InspectionJob> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    const job: InspectionJob = {
      ...jobData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.executeSql(
        `INSERT INTO jobs (id, title, description, location, status, priority, assignedTo, dueDate, createdAt, updatedAt, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.id,
          job.title,
          job.description || null,
          job.location,
          job.status,
          job.priority,
          job.assignedTo || null,
          job.dueDate,
          job.createdAt,
          job.updatedAt,
          job.notes || null,
        ]
      );

      // Add to sync queue
      await this.addToSyncQueue('CREATE', 'jobs', id, job);

      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Get all jobs
   */
  static async getAllJobs(): Promise<InspectionJob[]> {
    const db = getDatabase();
    try {
      const result = await db.executeSql('SELECT * FROM jobs ORDER BY dueDate ASC');
      return this.mapQueryResult(result);
    } catch (error) {
      console.error('Error getting all jobs:', error);
      throw error;
    }
  }

  /**
   * Get jobs by status
   */
  static async getJobsByStatus(status: JobStatus): Promise<InspectionJob[]> {
    const db = getDatabase();
    try {
      const result = await db.executeSql(
        'SELECT * FROM jobs WHERE status = ? ORDER BY dueDate ASC',
        [status]
      );
      return this.mapQueryResult(result);
    } catch (error) {
      console.error('Error getting jobs by status:', error);
      throw error;
    }
  }

  /**
   * Get a single job by ID
   */
  static async getJobById(jobId: string): Promise<InspectionJob | null> {
    const db = getDatabase();
    try {
      const result = await db.executeSql('SELECT * FROM jobs WHERE id = ?', [jobId]);
      const jobs = this.mapQueryResult(result);
      return jobs.length > 0 ? jobs[0] : null;
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  }

  /**
   * Update a job
   */
  static async updateJob(jobId: string, updates: Partial<InspectionJob>): Promise<InspectionJob> {
    const db = getDatabase();
    const now = new Date().toISOString();

    const updateData = {
      ...updates,
      updatedAt: now,
    };

    try {
      const fields = Object.keys(updateData)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = Object.values(updateData);

      await db.executeSql(`UPDATE jobs SET ${fields} WHERE id = ?`, [...values, jobId]);

      // Add to sync queue
      await this.addToSyncQueue('UPDATE', 'jobs', jobId, updateData);

      const updated = await this.getJobById(jobId);
      if (!updated) throw new Error('Job not found after update');
      return updated;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  /**
   * Delete a job
   */
  static async deleteJob(jobId: string): Promise<void> {
    const db = getDatabase();
    try {
      await db.executeSql('DELETE FROM jobs WHERE id = ?', [jobId]);

      // Add to sync queue
      await this.addToSyncQueue('DELETE', 'jobs', jobId, { id: jobId });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  /**
   * Complete a job
   */
  static async completeJob(jobId: string, notes?: string): Promise<InspectionJob> {
    const now = new Date().toISOString();
    return this.updateJob(jobId, {
      status: 'completed',
      completedAt: now,
      notes: notes || undefined,
    } as Partial<InspectionJob>);
  }

  /**
   * Get jobs that need syncing
   */
  static async getSyncQueue(): Promise<any[]> {
    const db = getDatabase();
    try {
      const result = await db.executeSql(
        'SELECT * FROM sync_queue WHERE synced = 0 ORDER BY createdAt ASC'
      );
      return result.rows._array;
    } catch (error) {
      console.error('Error getting sync queue:', error);
      throw error;
    }
  }

  /**
   * Mark sync queue item as synced
   */
  static async markAsSynced(syncId: string): Promise<void> {
    const db = getDatabase();
    try {
      await db.executeSql('UPDATE sync_queue SET synced = 1 WHERE id = ?', [syncId]);
    } catch (error) {
      console.error('Error marking as synced:', error);
      throw error;
    }
  }

  /**
   * Add operation to sync queue
   */
  private static async addToSyncQueue(
    operation: string,
    tableName: string,
    recordId: string,
    payload: any
  ): Promise<void> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      await db.executeSql(
        `INSERT INTO sync_queue (id, operation, table_name, record_id, payload, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, operation, tableName, recordId, JSON.stringify(payload), now]
      );
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      // Don't throw - sync queue issues shouldn't break the app
    }
  }

  /**
   * Map SQLite query results to objects
   */
  private static mapQueryResult(result: any[]): InspectionJob[] {
    if (result.length === 0) {
      return [];
    }

    return result[0].rows._array.map((row: any) => ({
      ...row,
      imageUris: row.imageUris ? JSON.parse(row.imageUris) : [],
    }));
  }
}
