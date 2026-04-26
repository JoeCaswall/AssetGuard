import { JobRepository } from '@database/JobRepository';
import { apiService } from './apiService';
import { useJobStore } from '@store/jobStore';

/**
 * Sync service for handling offline-first synchronization
 */
class SyncService {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize periodic sync
   */
  initializeSyncInterval(intervalMs: number = 30000): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      this.syncChanges();
    }, intervalMs);

    // Try initial sync
    this.syncChanges();
  }

  /**
   * Stop periodic sync
   */
  stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending changes
   */
  async syncChanges(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    const store = useJobStore.getState();

    try {
      // Check if backend is available
      const isAvailable = await apiService.healthCheck();
      if (!isAvailable) {
        console.warn('Backend not available, skipping sync');
        store.setSyncStatus({
          isSyncing: false,
          error: 'Backend unavailable',
        });
        return { success: 0, failed: 0 };
      }

      // Get pending changes from sync queue
      const syncQueue = await JobRepository.getSyncQueue();

      if (syncQueue.length === 0) {
        store.setSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date().toISOString(),
          pendingChanges: 0,
        });
        this.isSyncing = false;
        return { success: 0, failed: 0 };
      }

      store.setSyncStatus({
        isSyncing: true,
        pendingChanges: syncQueue.length,
      });

      let successCount = 0;
      let failedCount = 0;

      // Process each change
      for (const item of syncQueue) {
        try {
          await this.processSyncItem(item);
          await JobRepository.markAsSynced(item.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failedCount++;
        }
      }

      store.setSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        pendingChanges: Math.max(0, syncQueue.length - successCount),
      });

      console.log(`Sync complete: ${successCount} success, ${failedCount} failed`);
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Sync error:', error);
      store.setSyncStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
      return { success: 0, failed: 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process individual sync queue item
   */
  private async processSyncItem(item: any): Promise<void> {
    const payload = JSON.parse(item.payload);

    switch (item.operation) {
      case 'CREATE':
        await apiService.createJob(payload);
        break;

      case 'UPDATE':
        await apiService.updateJob(item.record_id, payload);
        break;

      case 'DELETE':
        await apiService.deleteJob(item.record_id);
        break;

      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<{ success: number; failed: number }> {
    return this.syncChanges();
  }

  /**
   * Get pending changes count
   */
  async getPendingChangesCount(): Promise<number> {
    try {
      const syncQueue = await JobRepository.getSyncQueue();
      return syncQueue.length;
    } catch (error) {
      console.error('Error getting pending changes:', error);
      return 0;
    }
  }
}

export const syncService = new SyncService();
