import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AssetGuardProvider } from './src/context/AssetGuardProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { useSnapshotData } from './src/context/AssetGuardProvider';

function AppShell() {
  const { tasks } = useSnapshotData();
  const [selectedTaskId, setSelectedTaskId] = React.useState<string>();
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);

  if (selectedTask) {
    return <TaskDetailScreen task={selectedTask} onBack={() => setSelectedTaskId(undefined)} />;
  }

  return <HomeScreen onSelectTask={(taskId) => setSelectedTaskId(taskId)} />;
}

export default function App() {
  return (
    <AssetGuardProvider>
      <StatusBar style="dark" />
      <AppShell />
    </AssetGuardProvider>
  );
}
