export const formatMinutesToHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const formatMinutesToHoursShort = (mins: number) => `${Math.floor(mins / 60)}h`;

export const formatAchievementName = (name: string): string => name.replace(/_/g, ' ').trim();

export const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();

/** "Mar 16" — used wherever a feed row has no room for a full date. */
export const formatShortDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Explicit grouping: toLocaleString() silently drops separators where Intl data is missing. */
export const formatThousands = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
