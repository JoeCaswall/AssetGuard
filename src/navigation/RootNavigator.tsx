/**
 * Root navigation stack for the application
 * Handles main navigation structure and bottom tabs
 */

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  JobsStackParamList,
  SettingsStackParamList,
  BottomTabParamList,
} from '../types';

// Placeholder imports - will be replaced with actual screens
// import JobsScreen from '../screens/Jobs';
// import JobDetailScreen from '../screens/JobDetail';
// import CreateJobScreen from '../screens/CreateJob';
// import SettingsScreen from '../screens/Settings';

const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

// Placeholder components - will be replaced with actual screens
const placeholderStyle = {
  flex: 1 as const,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={placeholderStyle}>
    <Text>{name} Screen - To be implemented</Text>
  </View>
);

/**
 * Jobs stack navigator
 * Contains Jobs list, job details, and create job screens
 */
const JobsStackNavigator = () => {
  return (
    <JobsStack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <JobsStack.Screen
        name="JobsList"
        component={() => <PlaceholderScreen name="Jobs List" />}
        options={{ title: 'My Jobs' }}
      />
      {/* Additional screens to be uncommented when implemented:
      <JobsStack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={{ title: 'Job Details' }}
      />
      <JobsStack.Screen
        name="CreateJob"
        component={CreateJobScreen}
        options={{ title: 'New Job' }}
      /> */}
    </JobsStack.Navigator>
  );
};

/**
 * Settings stack navigator
 */
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsScreen"
        component={() => <PlaceholderScreen name="Settings" />}
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
};

/**
 * Root navigator with bottom tab navigation
 */
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <BottomTab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999999',
        }}>
        <BottomTab.Screen
          name="JobsStack"
          component={JobsStackNavigator}
          options={{
            title: 'Jobs',
            tabBarLabel: 'Jobs',
          }}
        />
        <BottomTab.Screen
          name="SettingsStack"
          component={SettingsStackNavigator}
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
          }}
        />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
