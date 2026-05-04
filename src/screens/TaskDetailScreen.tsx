import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { useAssetGuard } from '../context/AssetGuardProvider';
import { AssetTask } from '../types/domain';
import { formatShortDate } from '../utils/date';

interface TaskDetailScreenProps {
  task: AssetTask;
  onBack: () => void;
}

export function TaskDetailScreen({ task, onBack }: TaskDetailScreenProps) {
  const { theme } = useAssetGuard();

  return (
    <Screen>
      <Pressable onPress={onBack} style={[styles.backButton, { borderColor: theme.border }]}> 
        <Text style={[styles.backButtonText, { color: theme.text }]}>Back to tasks</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <View style={styles.rowBetween}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.text }]}>{task.assetName}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{task.siteName}</Text>
          </View>
          <StatusBadge
            label={task.priority}
            tone={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'}
          />
        </View>
        <Text style={[styles.summary, { color: theme.textMuted }]}>{task.summary}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Task details</Text>
        <DetailRow label="Task ID" value={task.id} />
        <DetailRow label="Asset ID" value={task.assetId} />
        <DetailRow label="Site" value={task.siteName} />
        <DetailRow label="Due date" value={formatShortDate(task.dueDate)} />
        <DetailRow label="Status" value={task.status} />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>TODO: Inspection action</Text>
        <Text style={[styles.body, { color: theme.textMuted }]}>This screen establishes task-level context. Next step is to implement inspection actions here</Text>
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAssetGuard();

  return (
    <View style={[styles.detailRow, { borderBottomColor: theme.border }]}> 
      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  detailRow: {
    borderBottomWidth: 1,
    gap: 6,
    paddingBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});