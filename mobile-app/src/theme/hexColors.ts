import { tailwindColors, brand } from './theme';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';

export const HEX_COLORS = {
  playtime: {
    hex: parseRGB(tailwindColors.blue[600]),
    gradientHex: parseRGB(tailwindColors.blue[400]),
  },
  lastPlayed: {
    hex: parseRGB(tailwindColors.violet[600]),
    gradientHex: parseRGB(tailwindColors.violet[400]),
  },
  genre: {
    hex: parseRGB(tailwindColors.fuchsia[600]),
    gradientHex: parseRGB(tailwindColors.fuchsia[400]),
  },
  maxPerDay: {
    hex: parseRGB(tailwindColors.orange[600]),
    gradientHex: parseRGB(tailwindColors.orange[400]),
  },
  dayStreak: {
    hex: parseRGB(tailwindColors.red[600]),
    gradientHex: parseRGB(tailwindColors.red[400]),
  },
  gameStreak: {
    hex: parseRGB(tailwindColors.lime[600]),
    gradientHex: parseRGB(tailwindColors.lime[400]),
  },
  topPlatform: {
    hex: parseRGB(tailwindColors.emerald[600]),
    gradientHex: parseRGB(tailwindColors.emerald[400]),
  },
  gameStatus: {
    playing: {
      hex: parseRGB(tailwindColors.yellow[500]),
    },
    to_be_played: {
      hex: parseRGB(tailwindColors.amber[700]),
    },
    shelved: {
      hex: parseRGB(tailwindColors.zinc[500]),
    },
    platinato: {
      hex: parseRGB(tailwindColors.slate[300]),
    },
  },
  comparison: {
    user: {
      hex: parseRGB(brand.primary['500']),
      gradientHex: parseRGB(brand.primary['400']),
    },
    compare: {
      hex: parseRGB(tailwindColors.emerald[600]),
      gradientHex: parseRGB(tailwindColors.emerald[400]),
    },
  },
  muted: {
    icon: { hex: '#737373' },
    divider: { hex: '#333333' },
  },
  chart: {
    other: { hex: parseRGB(tailwindColors.zinc[600]) },
  },
  overlay: {
    icon: { hex: '#FFFFFF' },
  },
  feedback: {
    error: { hex: parseRGB(brand.error['500']) },
    success: { hex: parseRGB(brand.success['600']) },
    info: { hex: parseRGB(brand.primary['500']) },
    warning: { hex: parseRGB(brand.warning['500']) },
  },
  social: {
    action: {
      add: { hex: parseRGB(brand.primary['500']) },
      accept: { hex: parseRGB(brand.primary['500']) },
      destructive: { hex: parseRGB(brand.error['500']) },
      neutral: { hex: '#737373' }, // Matches muted.icon
    },
  },
  recommender: {
    sparkles: { hex: parseRGB(brand.primary['500']) },
    match: { hex: parseRGB(brand.primary['500']) },
  },
} as const;

export const CHART_PALETTE = [
  parseRGB(tailwindColors.blue[600]),
  parseRGB(tailwindColors.violet[600]),
  parseRGB(tailwindColors.fuchsia[600]),
  parseRGB(tailwindColors.orange[600]),
  parseRGB(tailwindColors.lime[600]),
  parseRGB(tailwindColors.emerald[600]),
];

export const CHART_GRADIENT_PALETTE = [
  { color: parseRGB(tailwindColors.blue[600]), gradient: parseRGB(tailwindColors.blue[400]) },
  { color: parseRGB(tailwindColors.violet[600]), gradient: parseRGB(tailwindColors.violet[400]) },
  { color: parseRGB(tailwindColors.fuchsia[600]), gradient: parseRGB(tailwindColors.fuchsia[400]) },
  { color: parseRGB(tailwindColors.orange[600]), gradient: parseRGB(tailwindColors.orange[400]) },
  { color: parseRGB(tailwindColors.lime[600]), gradient: parseRGB(tailwindColors.lime[400]) },
  { color: parseRGB(tailwindColors.emerald[600]), gradient: parseRGB(tailwindColors.emerald[400]) },
];
