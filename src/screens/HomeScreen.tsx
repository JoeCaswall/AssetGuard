import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { useAssetGuard, useSnapshotData } from '../context/AssetGuardProvider';
import { MOCK_SYNC_API_URL } from '../services/sync/syncService';
import { loadDatabaseDebugView } from '../storage/sqliteStorage';

import { formatShortDate } from '../utils/date';

interface HomeScreenProps {
  onSelectTask?: (taskId: string) => void;
}

export function HomeScreen({ onSelectTask }: HomeScreenProps) {
  const { theme, syncPendingInspectionEntries } = useAssetGuard();
  const { tasks } = useSnapshotData();
  const [databasePreview, setDatabasePreview] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [isLoadingDatabasePreview, setIsLoadingDatabasePreview] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const highPriorityCount = tasks.filter((task) => task.priority === 'high').length;
  const uniqueSiteCount = new Set(tasks.map((task) => task.siteName)).size;

  async function handleViewLocalDatabase() {
    try {
      setIsLoadingDatabasePreview(true);
      setDebugError(null);

      const debugView = await loadDatabaseDebugView();
      const preview = JSON.stringify(debugView, null, 2);

      console.log('AssetGuard SQLite contents', debugView);
      setDatabasePreview(preview);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load SQLite database contents.';

      setDebugError(message);
      setDatabasePreview(null);
    } finally {
      setIsLoadingDatabasePreview(false);
    }
  }

  async function handleSyncToBackend() {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const syncedEntryCount = await syncPendingInspectionEntries();

      if (syncedEntryCount === 0) {
        setSyncStatusMessage('No unsynced local inspection entries were found.');
      } else {
        setSyncStatusMessage(`Synced ${syncedEntryCount} entr${syncedEntryCount === 1 ? 'y' : 'ies'} to the placeholder backend.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sync local inspection data.';

      setSyncError(message);
      setSyncStatusMessage(null);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.heroTitle, { color: theme.text }]}>AssetGuard</Text>
        <Text style={[styles.heroCopy, { color: theme.textMuted }]}>A focused home screen for the field task overview, ready for incremental feature commits later.</Text>
        <View style={styles.heroStats}>
          <View style={[styles.metric, { backgroundColor: theme.surfaceMuted }]}> 
            <Text style={[styles.metricValue, { color: theme.text }]}>{tasks.length}</Text>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Tasks</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: theme.surfaceMuted }]}> 
            <Text style={[styles.metricValue, { color: theme.text }]}>{highPriorityCount}</Text>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>High Priority</Text>
          </View>
          <View style={[styles.metric, { backgroundColor: theme.surfaceMuted }]}> 
            <Text style={[styles.metricValue, { color: theme.text }]}>{uniqueSiteCount}</Text>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Sites</Text>
          </View>
        </View>
        <Text style={[styles.helper, { color: theme.textMuted }]}>Inspection capture is stored locally first, then posted to a placeholder backend when you trigger sync.</Text>
        <View style={styles.syncSection}>
          <Pressable
            onPress={() => { void handleSyncToBackend(); }}
            style={[styles.syncButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.syncButtonLabel}>{isSyncing ? 'Syncing...' : 'Sync to backend API'}</Text>
          </Pressable>
          <Text style={[styles.helper, { color: theme.textMuted }]}>Placeholder endpoint: {MOCK_SYNC_API_URL}</Text>
          {syncStatusMessage ? (
            <Text style={[styles.syncStatus, { color: theme.text }]}>{syncStatusMessage}</Text>
          ) : null}
          {syncError ? (
            <Text style={[styles.debugError, { color: theme.danger }]}>Sync error: {syncError}</Text>
          ) : null}
        </View>
        {__DEV__ ? (
          <View style={styles.debugSection}>
            <Pressable
              onPress={() => { void handleViewLocalDatabase(); }}
              style={[styles.debugButton, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}
            >
              <Text style={[styles.debugButtonLabel, { color: theme.text }]}>
                {isLoadingDatabasePreview ? 'Loading local DB...' : 'View local DB'}
              </Text>
            </Pressable>
            <Text style={[styles.helper, { color: theme.textMuted }]}>Prints current SQLite rows to the console and previews them below.</Text>
            {debugError ? (
              <Text style={[styles.debugError, { color: theme.danger }]}>DB inspector error: {debugError}</Text>
            ) : null}
            {databasePreview ? (
              <View style={[styles.debugPreview, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                <ScrollView nestedScrollEnabled style={styles.debugPreviewScroll}>
                  <Text style={[styles.debugPreviewText, { color: theme.text }]}>{databasePreview}</Text>
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Scheduled tasks</Text>
      {tasks.map((task) => (
        <Pressable
          key={task.id}
          onPress={() => {onSelectTask?.(task.id)}}
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <View style={styles.rowBetween}>
            <View style={styles.cardHeaderCopy}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{task.assetName}</Text>
              <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>{task.siteName}</Text>
            </View>
            <StatusBadge
              label={task.priority}
              tone={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'}
            />
          </View>
          <Text style={[styles.cardSummary, { color: theme.textMuted }]}>{task.summary}</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.helper, { color: theme.textMuted }]}>Due {formatShortDate(task.dueDate)}</Text>
            <StatusBadge label={task.status} tone="primary" />
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  heroCopy: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  metric: {
    borderRadius: 18,
    flex: 1,
    padding: 14,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  debugButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  debugButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  debugError: {
    fontSize: 13,
    lineHeight: 18,
  },
  debugPreview: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 260,
    padding: 12,
  },
  debugPreviewScroll: {
    flexGrow: 0,
  },
  debugPreviewText: {
    fontFamily: 'Courier',
    fontSize: 11,
    lineHeight: 16,
  },
  debugSection: {
    gap: 10,
    marginTop: 4,
  },
  syncButton: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  syncButtonLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  syncSection: {
    gap: 10,
    marginTop: 4,
  },
  syncStatus: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  cardHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
  },
});
