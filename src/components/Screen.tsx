import React, { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { useAssetGuard } from '../context/AssetGuardProvider';

interface ScreenProps extends PropsWithChildren {
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, contentContainerStyle }: ScreenProps) {
  const { theme } = useAssetGuard();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}> 
      <ScrollView contentContainerStyle={[styles.content, contentContainerStyle]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 16,
  },
});
