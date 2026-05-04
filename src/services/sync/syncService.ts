import type { SyncInspectionEntry } from '../../storage/sqliteStorage';

export const MOCK_SYNC_API_URL = 'https://postman-echo.com/post';

export async function syncInspectionEntriesToApi(entries: SyncInspectionEntry[]): Promise<void> {
  const response = await fetch(MOCK_SYNC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'AssetGuard',
      sentAt: new Date().toISOString(),
      entries,
    }),
  });

  if (!response.ok) {
    throw new Error(`Sync request failed with status ${response.status}.`);
  }
}