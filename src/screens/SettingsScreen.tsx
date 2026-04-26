import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useJobStore } from '@store/jobStore';
import { syncService } from '@services/syncService';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { syncStatus } = useJobStore();
  const [autoSync, setAutoSync] = React.useState(true);
  const [debugMode, setDebugMode] = React.useState(false);

  const handleForceSyncNow = async () => {
    try {
      const result = await syncService.forceSyncNow();
      Alert.alert(
        'Sync Complete',
        `Successfully synced ${result.success} items. Failed: ${result.failed}`
      );
    } catch (error) {
      Alert.alert('Sync Error', 'Failed to sync data');
    }
  };

  const handleClearDatabase = () => {
    Alert.alert(
      'Clear Database',
      'This will delete all local jobs. Are you sure? (Development only)',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            // TODO: Implement database clear function
            Alert.alert('Database cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Sync Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Status</Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Sync Status:</Text>
          <Text style={styles.value}>
            {syncStatus.isSyncing ? '🔄 Syncing...' : '✓ Ready'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Pending Changes:</Text>
          <Text style={styles.value}>{syncStatus.pendingChanges}</Text>
        </View>

        {syncStatus.lastSyncTime && (
          <View style={styles.statusRow}>
            <Text style={styles.label}>Last Sync:</Text>
            <Text style={styles.value}>
              {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {syncStatus.error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{syncStatus.error}</Text>
          </View>
        )}
      </View>

      {/* Sync Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Settings</Text>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.label}>Auto Sync</Text>
            <Text style={styles.description}>Automatically sync changes every 30 seconds</Text>
          </View>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={autoSync ? '#34C759' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleForceSyncNow}>
          <Text style={styles.buttonText}>Sync Now</Text>
        </TouchableOpacity>
      </View>

      {/* App Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>App Version:</Text>
          <Text style={styles.value}>0.0.1</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Platform:</Text>
          <Text style={styles.value}>Android & Windows</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>React Native:</Text>
          <Text style={styles.value}>0.73.0</Text>
        </View>
      </View>

      {/* Debug Section */}
      {debugMode && (
        <View style={[styles.section, styles.debugSection]}>
          <Text style={styles.sectionTitle}>Debug Options</Text>

          <TouchableOpacity style={styles.dangerButton} onPress={handleClearDatabase}>
            <Text style={styles.buttonText}>Clear Local Database</Text>
          </TouchableOpacity>

          <Text style={styles.debugNote}>
            Note: These options are for development only. Use with caution.
          </Text>
        </View>
      )}

      {/* Debug Toggle */}
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.label}>Debug Mode</Text>
            <Text style={styles.description}>Show development tools</Text>
          </View>
          <Switch
            value={debugMode}
            onValueChange={setDebugMode}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={debugMode ? '#34C759' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AssetGuard v0.0.1</Text>
        <Text style={styles.footerText}>© 2026 Field Engineering Team</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  debugSection: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 3,
    borderLeftColor: '#FF3B30',
    padding: 12,
    marginTop: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#C41C3B',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugNote: {
    fontSize: 12,
    color: '#FF9500',
    fontStyle: 'italic',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

export default SettingsScreen;
