import { AssetTask } from '../types/domain';

export const seedTasks: AssetTask[] = [
  {
    id: 'task-substation-01',
    assetId: 'AST-2001',
    assetName: 'North Ridge Transformer',
    siteName: 'North Ridge Substation',
    dueDate: '2026-05-02T09:00:00.000Z',
    priority: 'high',
    status: 'pending',
    summary: 'Inspect insulation, containment seals, and thermal anomalies.',
  },
  {
    id: 'task-pump-04',
    assetId: 'AST-3388',
    assetName: 'Booster Pump 4',
    siteName: 'South Valley Pump House',
    dueDate: '2026-05-04T10:30:00.000Z',
    priority: 'medium',
    status: 'pending',
    summary: 'Confirm safe isolation, leak state, and housing integrity.',
  },
  {
    id: 'task-gateway-03',
    assetId: 'AST-4107',
    assetName: 'Telemetry Gateway 3',
    siteName: 'Western Relay Cabin',
    dueDate: '2026-05-05T15:00:00.000Z',
    priority: 'low',
    status: 'pending',
    summary: 'Verify enclosure condition and field connectivity hardware.',
  },
];
