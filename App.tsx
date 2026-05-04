import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AssetGuardProvider } from './src/context/AssetGuardProvider';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  return (
    <AssetGuardProvider>
      <StatusBar style="dark" />
      <HomeScreen />
    </AssetGuardProvider>
  );
}
