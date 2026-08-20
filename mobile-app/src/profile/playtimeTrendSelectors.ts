import type { PlaytimeByUser } from '@gamelog/api-manager/dto';
import { formatMinutesToHours, toIsoDate } from '@gamelog/utils/formatUtils';

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
  label: string;
  accessibilityLabel: string;
  percentOfPeak: number;
  isToday: boolean;
}

export interface PlaytimeTrend {
  days: TrendDay[];
  totalLabel: string;
  /** "Tue · 4h 12m", or null when nothing was played. */
  peakLabel: string | null;
  activeDaysLabel: string;
  hasPlaytime: boolean;
}

const buildWindow = (days: number, endDate: Date): Date[] =>
  Array.from({ length: Math.max(0, days) }, (_, index) => {
    const day = new Date(endDate);
    day.setDate(day.getDate() - (days - 1 - index));
    return day;
  });

const indexByDate = (series?: PlaytimeByUser | null): Map<string, number> => {
  const minutesByDate = new Map<string, number>();

  (series ?? []).forEach((entry) => {
    if (!entry?.date) return;
    const minutes = Math.max(0, entry.playtime_minutes ?? 0);
    minutesByDate.set(entry.date, (minutesByDate.get(entry.date) ?? 0) + minutes);
  });

  return minutesByDate;
};

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
