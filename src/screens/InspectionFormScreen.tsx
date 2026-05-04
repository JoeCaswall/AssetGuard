import React from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import { useAssetGuard } from '../context/AssetGuardProvider';
import { AssetTask } from '../types/domain';
import { formatShortDate } from '../utils/date';
import {
  InspectionChecklist,
  InspectionCondition,
  buildInspectionDraftSummary,
  initialInspectionChecklist,
} from '../utils/inspectionForm';

interface InspectionFormScreenProps {
  task: AssetTask;
  onBack: () => void;
}

export function InspectionFormScreen({ task, onBack }: InspectionFormScreenProps) {
  const { theme } = useAssetGuard();
  const [engineerInitials, setEngineerInitials] = React.useState('');
  const [condition, setCondition] = React.useState<InspectionCondition>('pass');
  const [notes, setNotes] = React.useState('');
  const [checklist, setChecklist] = React.useState<InspectionChecklist>(initialInspectionChecklist);
  const draftSummary = buildInspectionDraftSummary({ engineerInitials, condition, notes, checklist });

  return (
    <Screen>
      <Pressable onPress={onBack} style={[styles.backButton, { borderColor: theme.border }]}> 
        <Text style={[styles.backButtonText, { color: theme.text }]}>Back to task</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <View style={styles.rowBetween}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: theme.text }]}>Inspection form</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{task.assetName}</Text>
          </View>
          <StatusBadge
            label={task.priority}
            tone={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'primary'}
          />
        </View>
        <Text style={[styles.summary, { color: theme.textMuted }]}>{task.siteName} · Due {formatShortDate(task.dueDate)}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Engineer details</Text>
        <TextInput
          autoCapitalize="characters"
          maxLength={6}
          onChangeText={setEngineerInitials}
          placeholder="Engineer initials"
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.text }]}
          value={engineerInitials}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Checklist</Text>
        <ChecklistRow
          label="Safe isolation confirmed"
          value={checklist.safeIsolation}
          onValueChange={(value) => setChecklist((current) => ({ ...current, safeIsolation: value }))}
        />
        <ChecklistRow
          label="Structural integrity acceptable"
          value={checklist.structuralIntegrity}
          onValueChange={(value) => setChecklist((current) => ({ ...current, structuralIntegrity: value }))}
        />
        <ChecklistRow
          label="No active leaks detected"
          value={checklist.leakCheck}
          onValueChange={(value) => setChecklist((current) => ({ ...current, leakCheck: value }))}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Condition</Text>
        <View style={styles.pillRow}>
          {(['pass', 'monitor', 'fail'] as InspectionCondition[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => setCondition(option)}
              style={[
                styles.pill,
                {
                  backgroundColor: condition === option ? theme.primary : theme.surfaceMuted,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: condition === option ? '#ffffff' : theme.text }}>{option.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Operational notes, anomalies, or actions taken"
          placeholderTextColor={theme.textMuted}
          style={[styles.textarea, { backgroundColor: theme.surfaceMuted, borderColor: theme.border, color: theme.text }]}
          textAlignVertical="top"
          value={notes}
        />
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}> 
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Current draft</Text>
        <DetailRow label="Initials" value={draftSummary.engineerInitials} />
        <DetailRow label="Condition" value={draftSummary.condition} />
        <DetailRow label="Checklist complete" value={String(draftSummary.checklistComplete)} />
        <DetailRow label="Notes length" value={String(draftSummary.notesLength)} />
      </View>
    </Screen>
  );
}

function ChecklistRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { theme } = useAssetGuard();

  return (
    <View style={styles.rowBetween}>
      <Text style={{ color: theme.text, flex: 1 }}>{label}</Text>
      <Switch onValueChange={onValueChange} thumbColor="#ffffff" trackColor={{ true: theme.primary }} value={value} />
    </View>
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
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textarea: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
});