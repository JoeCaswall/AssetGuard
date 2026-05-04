export function formatUnsyncedInspectionCount(count: number) {
  return `${count} unsynced local entr${count === 1 ? 'y' : 'ies'}`;
}