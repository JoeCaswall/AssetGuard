/**
 * Main entry point for the AssetGuard application
 */

import React, {useEffect} from 'react';
import {StatusBar, SafeAreaView} from 'react-native';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import store from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import logger from './src/utils/logger';

/**
 * Main App Component
 * Initializes Redux store, navigation, and global setup
 */
const App = (): React.JSX.Element => {
  useEffect(() => {
    logger.info('AssetGuard app initialized');
    // TODO: Initialize database
    // TODO: Check for pending syncs
    // TODO: Setup network listener
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
        </SafeAreaView>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
