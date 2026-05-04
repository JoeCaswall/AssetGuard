export function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString();
}
