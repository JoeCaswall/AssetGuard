export const LOCAL_DATA_RETENTION_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function hasLocalDataExpired(lastUpdatedAt: string, now: Date = new Date()) {
  const lastUpdatedDate = new Date(lastUpdatedAt);

  if (Number.isNaN(lastUpdatedDate.getTime())) {
    return false;
  }

  const ageInMilliseconds = now.getTime() - lastUpdatedDate.getTime();

  return ageInMilliseconds >= LOCAL_DATA_RETENTION_DAYS * MILLISECONDS_PER_DAY;
}