import { tailwindColors } from './theme';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

export const METRICS = {
  playtime: {
    borderClass: 'border-blue-600',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-100 dark:bg-blue-900/40',
    hex: parseRGB(tailwindColors.blue[600]),
    gradientHex: parseRGB(tailwindColors.blue[400]),
  },
  lastPlayed: {
    borderClass: 'border-violet-600',
    textClass: 'text-violet-600',
    bgClass: 'bg-violet-100 dark:bg-violet-900/40',
    hex: parseRGB(tailwindColors.violet[600]),
    gradientHex: parseRGB(tailwindColors.violet[400]),
  },
  genre: {
    borderClass: 'border-fuchsia-600',
    textClass: 'text-fuchsia-600',
    bgClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
    hex: parseRGB(tailwindColors.fuchsia[600]),
    gradientHex: parseRGB(tailwindColors.fuchsia[400]),
  },
  maxPerDay: {
    borderClass: 'border-orange-600',
    textClass: 'text-orange-600',
    bgClass: 'bg-orange-100 dark:bg-orange-900/40',
    hex: parseRGB(tailwindColors.orange[600]),
    gradientHex: parseRGB(tailwindColors.orange[400]),
  },
  streak: {
    borderClass: 'border-lime-600',
    textClass: 'text-lime-600',
    bgClass: 'bg-lime-100 dark:bg-lime-900/40',
    hex: parseRGB(tailwindColors.lime[600]),
    gradientHex: parseRGB(tailwindColors.lime[400]),
  },
  topPlatform: {
    borderClass: 'border-emerald-600',
    textClass: 'text-emerald-600',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/40',
    hex: parseRGB(tailwindColors.emerald[600]),
    gradientHex: parseRGB(tailwindColors.emerald[400]),
  },
} as const;

export const CHART_PALETTE = [
  METRICS.playtime.hex,
  METRICS.lastPlayed.hex,
  METRICS.genre.hex,
  METRICS.maxPerDay.hex,
  METRICS.streak.hex,
  METRICS.topPlatform.hex,
];

export const CHART_GRADIENT_PALETTE = [
  { color: METRICS.playtime.hex, gradient: METRICS.playtime.gradientHex },
  { color: METRICS.lastPlayed.hex, gradient: METRICS.lastPlayed.gradientHex },
  { color: METRICS.genre.hex, gradient: METRICS.genre.gradientHex },
  { color: METRICS.maxPerDay.hex, gradient: METRICS.maxPerDay.gradientHex },
  { color: METRICS.streak.hex, gradient: METRICS.streak.gradientHex },
  { color: METRICS.topPlatform.hex, gradient: METRICS.topPlatform.gradientHex },
];
