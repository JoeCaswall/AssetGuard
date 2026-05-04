import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAssetGuard } from '../context/AssetGuardProvider';

interface StatusBadgeProps {
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const { theme } = useAssetGuard();

  const backgroundColor = {
    primary: theme.primary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
