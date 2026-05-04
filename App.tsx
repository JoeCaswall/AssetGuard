import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AssetGuardProvider } from './src/context/AssetGuardProvider';
import { useSnapshotData } from './src/context/AssetGuardProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { InspectionFormScreen } from './src/screens/InspectionFormScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';

type AppRoute =
  | { name: 'home' }
  | { name: 'task-detail'; taskId: string }
  | { name: 'inspection-form'; taskId: string };

function AppShell() {
  const { tasks } = useSnapshotData();
  const [route, setRoute] = React.useState<AppRoute>({ name: 'home' });

  if (route.name === 'home') {
    return <HomeScreen onSelectTask={(taskId) => setRoute({ name: 'task-detail', taskId })} />;
  }

  const selectedTask = tasks.find((task) => task.id === route.taskId);

  if (!selectedTask) {
    return <HomeScreen onSelectTask={(taskId) => setRoute({ name: 'task-detail', taskId })} />;
  }

  if (route.name === 'inspection-form') {
    return (
      <InspectionFormScreen
        task={selectedTask}
        onBack={() => setRoute({ name: 'task-detail', taskId: selectedTask.id })}
      />
    );
  }

  return (
    <TaskDetailScreen
      task={selectedTask}
      onBack={() => setRoute({ name: 'home' })}
      onStartInspection={() => setRoute({ name: 'inspection-form', taskId: selectedTask.id })}
    />
  );
}

export default function App() {
  return (
    <AssetGuardProvider>
      <StatusBar style="dark" />
      <AppShell />
    </AssetGuardProvider>
  );
}
