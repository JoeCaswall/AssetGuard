import { LOCAL_DATA_RETENTION_DAYS, hasLocalDataExpired } from '../src/storage/retention';

describe('local data retention', () => {
  it('keeps local data when it is newer than the 90 day retention window', () => {
    expect(
      hasLocalDataExpired(
        '2026-02-05T00:00:00.000Z',
        new Date('2026-05-04T00:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('expires local data once it reaches the 90 day retention window', () => {
    expect(
      hasLocalDataExpired(
        '2026-02-03T00:00:00.000Z',
        new Date('2026-05-04T00:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('does not purge when the stored timestamp is invalid', () => {
    expect(hasLocalDataExpired('not-a-date')).toBe(false);
  });

  it('documents the expected retention policy length', () => {
    expect(LOCAL_DATA_RETENTION_DAYS).toBe(90);
  });
});