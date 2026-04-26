import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { initializeDatabase } from '@database/init';
import { syncService } from '@services/syncService';
import Navigation from '@navigation/Navigation';

const App = () => {
  useEffect(() => {
    initializeApp();

    return () => {
      // Cleanup on unmount
      syncService.stopSyncInterval();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initializeDatabase();
      console.log('App initialized successfully');

      // Initialize sync service
      syncService.initializeSyncInterval(30000); // Sync every 30 seconds
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
