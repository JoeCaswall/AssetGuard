import type { SyncInspectionEntry } from '../src/storage/sqliteStorage';
import { MOCK_SYNC_API_URL, syncInspectionEntriesToApi } from '../src/services/sync/syncService';

describe('sync service integration', () => {
  const fetchMock = jest.fn();

  const entries: SyncInspectionEntry[] = [
    {
      task: {
        id: 'task-1',
        asset_id: 'enc:v1:asset-id',
        asset_name: 'enc:v1:asset-name',
        site_name: 'enc:v1:site-name',
        due_date: 'enc:v1:due-date',
        priority: 'enc:v1:priority',
        status: 'enc:v1:status',
        summary: 'enc:v1:summary',
      },
      draft: {
        task_id: 'task-1',
        employee_number: 'enc:v1:employee-number',
        condition: 'enc:v1:condition',
        notes: 'enc:v1:notes',
        safe_isolation: 'enc:v1:safe-isolation',
        structural_integrity: 'enc:v1:structural-integrity',
        leak_check: 'enc:v1:leak-check',
        is_synced: 0,
      },
    },
  ];

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('posts unsynced inspection entries to the mock backend', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
    });

    await syncInspectionEntriesToApi(entries);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      MOCK_SYNC_API_URL,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body));

    expect(body).toEqual(
      expect.objectContaining({
        source: 'AssetGuard',
        sentAt: expect.any(String),
        entries,
      }),
    );
  });

  it('throws when the mock backend returns a non-success response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(syncInspectionEntriesToApi(entries)).rejects.toThrow(
      'Sync request failed with status 500.',
    );
  });
});