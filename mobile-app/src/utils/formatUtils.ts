export const formatMinutesToHours = (minutes: number): string => {
  if (minutes === 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const formatMinutesToHoursShort = (mins: number) => {
  if (mins === 0) return '0h';
  if (mins >= 60) return `${Math.floor(mins / 60)}h`;
  return `${mins}m`;
};

export const formatAchievementName = (name: string): string => name.replace(/_/g, ' ').trim();

export const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString();

/** "Mar 16" — used wherever a feed row has no room for a full date. */
export const formatShortDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** "Mar 16, 2026" — the year matters once a date is old enough to be ambiguous. */
export const formatShortDateWithYear = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * "2026-08-18" from local calendar fields. `toISOString()` is not usable here: it converts
 * to UTC first, which lands on the wrong day for anyone east or west of it late enough.
 */
export const toIsoDate = (value: Date): string =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate()
  ).padStart(2, '0')}`;

/** Explicit grouping: toLocaleString() silently drops separators where Intl data is missing. */
export const formatThousands = (value: number): string =>
  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatMinutesWithSeconds = (minutesFloat: number | undefined | null) => {
  if (
    minutesFloat === undefined ||
    minutesFloat === null ||
    isNaN(minutesFloat) ||
    !isFinite(minutesFloat)
  ) {
    return '0s';
  }
  const totalSeconds = Math.round(minutesFloat * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
