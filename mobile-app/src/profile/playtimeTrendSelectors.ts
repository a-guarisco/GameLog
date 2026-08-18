import type { PlaytimeByUser } from '@gamelog/api-manager/dto';
import { formatMinutesToHours, toIsoDate } from '@gamelog/utils/formatUtils';

/** Sunday-first, matching `Date.getDay()`. Two Ts and two Ss is what a 14-bar axis can afford. */
const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export interface TrendDay {
  /** ISO `YYYY-MM-DD`; doubles as the render key, so it is unique across the window. */
  date: string;
  minutes: number;
  /** Single letter under the bar. */
  label: string;
  /** Spoken by screen readers, where "T" would be useless. */
  accessibilityLabel: string;
  /** 0–100, relative to the busiest day so the tallest bar always fills the plot. */
  percentOfPeak: number;
  isToday: boolean;
}

export interface PlaytimeTrend {
  days: TrendDay[];
  /** Total across the window, e.g. "42h 36m". */
  totalLabel: string;
  /** "Tue · 4h 12m", or null when nothing was played. */
  peakLabel: string | null;
  /** "12 of 14 days". */
  activeDaysLabel: string;
  /** False when the window is empty or every day is zero — the caller shows a message instead. */
  hasPlaytime: boolean;
}

/** The last `days` days ending on `endDate`, oldest first — the axis is fixed-width by design. */
const buildWindow = (days: number, endDate: Date): Date[] =>
  Array.from({ length: Math.max(0, days) }, (_, index) => {
    const day = new Date(endDate);
    day.setDate(day.getDate() - (days - 1 - index));
    return day;
  });

/**
 * Sums duplicate entries rather than letting the last one win: the backend emits one row per
 * rolling snapshot, and two snapshots can land on the same calendar day.
 */
const indexByDate = (series?: PlaytimeByUser | null): Map<string, number> => {
  const minutesByDate = new Map<string, number>();

  (series ?? []).forEach((entry) => {
    if (!entry?.date) return;
    const minutes = Math.max(0, entry.playtime_minutes ?? 0);
    minutesByDate.set(entry.date, (minutesByDate.get(entry.date) ?? 0) + minutes);
  });

  return minutesByDate;
};

/**
 * Shapes the backend's day-by-day series into a fixed-width bar trend. Days the backend never
 * reported are rendered as zeros rather than dropped: a gap in the axis would read as a shorter
 * window instead of a day off.
 */
export const getPlaytimeTrend = (
  series?: PlaytimeByUser | null,
  days: number = 14,
  today: Date = new Date()
): PlaytimeTrend => {
  const minutesByDate = indexByDate(series);
  const todayIso = toIsoDate(today);

  const window = buildWindow(days, today).map((date) => {
    const iso = toIsoDate(date);
    return { date: iso, minutes: minutesByDate.get(iso) ?? 0, weekday: date.getDay() };
  });

  const peakMinutes = window.reduce((max, day) => Math.max(max, day.minutes), 0);
  const totalMinutes = window.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = window.filter((day) => day.minutes > 0).length;
  const peak = window.reduce<(typeof window)[number] | null>(
    (best, day) => (day.minutes > 0 && (!best || day.minutes > best.minutes) ? day : best),
    null
  );

  return {
    days: window.map((day) => ({
      date: day.date,
      minutes: day.minutes,
      label: WEEKDAY_INITIALS[day.weekday],
      accessibilityLabel: `${WEEKDAY_NAMES[day.weekday]}, ${formatMinutesToHours(day.minutes)}`,
      percentOfPeak: peakMinutes === 0 ? 0 : (day.minutes / peakMinutes) * 100,
      isToday: day.date === todayIso,
    })),
    totalLabel: formatMinutesToHours(totalMinutes),
    peakLabel: peak
      ? `${WEEKDAY_NAMES[peak.weekday].slice(0, 3)} · ${formatMinutesToHours(peak.minutes)}`
      : null,
    activeDaysLabel: `${activeDays} of ${window.length} days`,
    hasPlaytime: totalMinutes > 0,
  };
};
