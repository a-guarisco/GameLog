import type { PlaytimeByUser, GamePlaytime } from '@gamelog/api-manager/dto';
import { formatMinutesToHours, toIsoDate } from '@gamelog/utils/formatUtils';
import { tailwindColors } from '@gamelog/theme/theme';
import { parseRGB } from '../chartsHelpers';
import { CHART_PALETTE } from '@gamelog/theme/metrics';

const WEEKDAY_INITIALS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export interface TrendDayStack {
  value: number;
  color?: string;
  app_id?: string;
}

export interface TrendDay {
  /** ISO `YYYY-MM-DD`; doubles as the render key, so it is unique across the window. */
  date: string;
  minutes: number;
  label: string;
  accessibilityLabel: string;
  percentOfPeak: number;
  weekday: number;
  isToday: boolean;
  isFuture: boolean;
  isPastLimit: boolean;
  stacks: TrendDayStack[];
}

export interface PlaytimeTrend {
  days: TrendDay[];
  totalLabel: string;
  /** "Tue · 4h 12m", or null when nothing was played. */
  peakLabel: string | null;
  activeDaysLabel: string;
  hasPlaytime: boolean;
  /** Percentage change compared to the previous period of the same length. */
  periodDeltaPercent: number | null;
  /** Total playtime in the previous period (used for baseline calculations). */
  previousTotalMinutes: number;
}

// Chart palette colors
const STACK_PALETTE = [
  CHART_PALETTE[0],
  CHART_PALETTE[1],
  CHART_PALETTE[2],
  CHART_PALETTE[3],
  CHART_PALETTE[4],
  CHART_PALETTE[5],
];
const STACK_OTHER_COLOR = parseRGB(tailwindColors.zinc[600]);

const buildWindow = (days: number, endDate: Date): Date[] =>
  Array.from({ length: Math.max(0, days) }, (_, index) => {
    const day = new Date(endDate);
    day.setDate(day.getDate() - (days - 1 - index));
    return day;
  });

interface IndexedDay {
  minutes: number;
  games: GamePlaytime[];
}

const indexByDate = (series?: PlaytimeByUser | null): Map<string, IndexedDay> => {
  const byDate = new Map<string, IndexedDay>();

  (series ?? []).forEach((entry) => {
    if (!entry?.date) return;
    const minutes = Math.max(0, entry.playtime_minutes ?? 0);
    const games = entry.games ?? [];
    const existing = byDate.get(entry.date);
    if (existing) {
      existing.minutes += minutes;
      existing.games = [...existing.games, ...games];
    } else {
      byDate.set(entry.date, { minutes, games });
    }
  });

  return byDate;
};

export const selectPlaytimeTrend = (
  series?: PlaytimeByUser | null,
  range: number | 'week' = 14,
  weekOffset: number = 0,
  today: Date = new Date(),
  baseLimitDate?: string | null
): PlaytimeTrend => {
  const byDate = indexByDate(series);
  const todayIso = toIsoDate(today);

  let windowDates: Date[];
  let previousWindowDates: Date[];

  if (range === 'week') {
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const targetMonday = new Date(today);
    targetMonday.setDate(today.getDate() + diffToMonday + weekOffset * 7);

    windowDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(targetMonday);
      d.setDate(targetMonday.getDate() + i);
      return d;
    });

    const prevMonday = new Date(targetMonday);
    prevMonday.setDate(targetMonday.getDate() - 7);
    previousWindowDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(prevMonday);
      d.setDate(prevMonday.getDate() + i);
      return d;
    });
  } else {
    const targetEndDate = new Date(today);
    targetEndDate.setDate(today.getDate() + weekOffset * range);

    windowDates = buildWindow(range, targetEndDate);
    const previousEndDate = new Date(targetEndDate);
    previousEndDate.setDate(previousEndDate.getDate() - range);
    previousWindowDates = buildWindow(range, previousEndDate);
  }

  // Calculate stats for the current window
  const window = windowDates.map((date) => {
    const iso = toIsoDate(date);
    const data = byDate.get(iso) ?? { minutes: 0, games: [] };
    const isPastLimit = baseLimitDate ? iso < baseLimitDate : false;
    return {
      date: iso,
      minutes: data.minutes,
      games: data.games,
      weekday: date.getDay(),
      isFuture: iso > todayIso,
      isPastLimit,
    };
  });

  const peakMinutes = window.reduce((max, day) => Math.max(max, day.minutes), 0);
  const totalMinutes = window.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = window.filter((day) => day.minutes > 0).length;
  const peak = window.reduce<(typeof window)[number] | null>(
    (best, day) => (day.minutes > 0 && (!best || day.minutes > best.minutes) ? day : best),
    null
  );

  // Calculate stats for the previous window (to compute stock-style percentage delta)
  const previousWindow = previousWindowDates.map((date) => {
    const iso = toIsoDate(date);
    return byDate.get(iso)?.minutes ?? 0;
  });
  const previousTotalMinutes = previousWindow.reduce((sum, m) => sum + m, 0);

  let periodDeltaPercent: number | null = null;
  if (previousTotalMinutes > 0) {
    periodDeltaPercent = ((totalMinutes - previousTotalMinutes) / previousTotalMinutes) * 100;
  } else if (totalMinutes > 0) {
    periodDeltaPercent = 100; // Infinite growth from 0
  }

  return {
    days: window.map((day) => {
      // Sort games by playtime descending
      const sortedGames = [...day.games].sort((a, b) => b.playtime_minutes - a.playtime_minutes);

      const stacks: TrendDayStack[] = [];
      let otherMinutes = 0;

      sortedGames.forEach((g, idx) => {
        if (idx < STACK_PALETTE.length) {
          stacks.push({
            value: g.playtime_minutes,
            color: STACK_PALETTE[idx],
            app_id: g.app_id,
          });
        } else {
          otherMinutes += g.playtime_minutes;
        }
      });

      if (otherMinutes > 0) {
        stacks.push({
          value: otherMinutes,
          color: STACK_OTHER_COLOR,
          app_id: 'other',
        });
      }

      // If no games breakdown, ensure at least one stack to prevent gifted-charts crashes
      if (stacks.length === 0) {
        stacks.push({ value: day.minutes > 0 ? day.minutes : 0, color: STACK_PALETTE[0] });
      }

      return {
        date: day.date,
        minutes: day.minutes,
        label: WEEKDAY_INITIALS[day.weekday],
        accessibilityLabel: `${WEEKDAY_NAMES[day.weekday]}, ${day.minutes}m`,
        percentOfPeak: peakMinutes === 0 ? 0 : (day.minutes / peakMinutes) * 100,
        weekday: day.weekday,
        isToday: day.date === todayIso,
        isFuture: day.isFuture,
        isPastLimit: day.isPastLimit,
        stacks,
      };
    }),
    totalLabel: formatMinutesToHours(totalMinutes),
    peakLabel: peak
      ? `${WEEKDAY_NAMES[peak.weekday].slice(0, 3)} · ${formatMinutesToHours(peak.minutes)}`
      : null,
    activeDaysLabel: `${activeDays} of ${window.length} days`,
    hasPlaytime: totalMinutes > 0,
    periodDeltaPercent,
    previousTotalMinutes,
  };
};
