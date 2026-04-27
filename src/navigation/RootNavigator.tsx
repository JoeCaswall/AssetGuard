/**
 * Root navigation stack for the application
 * Handles main navigation structure and bottom tabs
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationParams } from '../types';

// Placeholder imports - will be replaced with actual screens
// import JobsScreen from '../screens/Jobs';
// import JobDetailScreen from '../screens/JobDetail';
// import CreateJobScreen from '../screens/CreateJob';
// import SettingsScreen from '../screens/Settings';

const Stack = createNativeStackNavigator<NavigationParams>();
const Tab = createBottomTabNavigator<NavigationParams>();

/**
 * Jobs stack navigator
 * Contains Jobs list, job details, and create job screens
 */
const JobsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      {/* <Stack.Screen 
        name="Jobs" 
        component={JobsScreen}
        options={{ title: 'My Jobs' }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <Stack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ title: 'New Job' }}
      /> */}
    </Stack.Navigator>
  );
};

/**
 * Settings stack navigator
 */
const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      /> */}
    </Stack.Navigator>
  );
};

/**
 * Root navigator with bottom tab navigation
 */
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999999',
        }}
      >
        <Tab.Screen
          name="Jobs"
          component={JobsStackNavigator}
          options={{
            title: 'Jobs',
            tabBarLabel: 'Jobs',
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
