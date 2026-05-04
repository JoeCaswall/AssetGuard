import { formatUnsyncedInspectionCount } from '../src/utils/syncStatus';

describe('sync status helpers', () => {
  it('formats the singular unsynced entry label', () => {
    expect(formatUnsyncedInspectionCount(1)).toBe('1 unsynced local entry');
  });

  it('formats the plural unsynced entry label', () => {
    expect(formatUnsyncedInspectionCount(3)).toBe('3 unsynced local entries');
  });

  it('formats zero unsynced entries consistently', () => {
    expect(formatUnsyncedInspectionCount(0)).toBe('0 unsynced local entries');
  });
});