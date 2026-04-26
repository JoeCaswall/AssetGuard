import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '@types/index';

// Screens (to be implemented)
// import JobsListScreen from '@screens/JobsListScreen';
// import JobDetailScreen from '@screens/JobDetailScreen';
// import CreateJobScreen from '@screens/CreateJobScreen';
// import SettingsScreen from '@screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Stack navigator for jobs
 */
const JobsStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      {/* <Stack.Screen
        name="JobsList"
        component={JobsListScreen}
        options={{
          title: 'Inspection Jobs',
        }}
      />
      <Stack.Screen
        name="JobDetail"
        component={JobDetailScreen}
        options={({ route }) => ({
          title: 'Job Details',
        })}
      />
      <Stack.Screen
        name="EditJob"
        component={CreateJobScreen}
        options={{
          title: 'Edit Job',
        }}
      /> */}
    </Stack.Navigator>
  );
};

/**
 * Bottom tab navigator
 */
const RootNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="JobsTab"
        component={JobsStackNavigator}
        options={{
          title: 'Jobs',
          tabBarLabel: 'Jobs',
          // tabBarIcon: ({ color, size }) => (
          //   <MaterialCommunityIcons name="list" color={color} size={size} />
          // ),
        }}
      />
      {/* <Tab.Screen
        name="CreateJobTab"
        component={CreateJobScreen}
        options={{
          title: 'Create Job',
          tabBarLabel: 'Create',
          // tabBarIcon: ({ color, size }) => (
          //   <MaterialCommunityIcons name="plus" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          // tabBarIcon: ({ color, size }) => (
          //   <MaterialCommunityIcons name="cog" color={color} size={size} />
          // ),
        }}
      /> */}
    </Tab.Navigator>
  );
};

/**
 * Navigation setup component
 */
export const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation;
