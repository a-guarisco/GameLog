import type { GameItem, OwnedGames } from '@gamelog/api-manager/dto';
import { formatThousands } from '@gamelog/utils/formatUtils';

export interface PlatformShare {
  id: string;
  name: string;
  /** Ionicons glyph for the row. */
  icon: string;
  minutes: number;
  /** "1,152h". */
  hoursLabel: string;
  /** 0–100, used for the segment's share of the stacked bar. */
  percent: number;
  /** "80%", or "<1%" for a platform that rounds away but was still played. */
  percentLabel: string;
}

export interface PlatformSplit {
  /** Busiest platform first; platforms never played are dropped entirely. */
  shares: PlatformShare[];
  /** Lifetime hours across every platform, e.g. "1,438h". */
  totalLabel: string;
  hasPlaytime: boolean;
}

/**
 * Steam reports per-OS playtime on the owned-games payload. Deck time is counted separately
 * from Windows even though the Deck runs Linux, because that is how Steam reports it.
 */
const PLATFORMS: { id: string; name: string; icon: string; field: keyof GameItem }[] = [
  { id: 'windows', name: 'Windows', icon: 'logo-windows', field: 'playtime_windows_forever' },
  { id: 'deck', name: 'Steam Deck', icon: 'logo-steam', field: 'playtime_deck_forever' },
  { id: 'linux', name: 'Linux', icon: 'logo-tux', field: 'playtime_linux_forever' },
  { id: 'mac', name: 'macOS', icon: 'logo-apple', field: 'playtime_mac_forever' },
];

const toHoursLabel = (minutes: number) => `${formatThousands(Math.floor(minutes / 60))}h`;

/**
 * Rounds for display but never down to "0%": a platform earned its row by being played, and
 * a 0% row next to a visible bar segment reads as a bug.
 */
const toPercentLabel = (percent: number) => {
  const rounded = Math.round(percent);
  return rounded === 0 ? '<1%' : `${rounded}%`;
};

/** Lifetime hours per platform, ranked. Shaped for a stacked bar with a row per segment. */
export const getPlatformSplit = (ownedGames?: OwnedGames | null): PlatformSplit => {
  const games = ownedGames?.response?.games ?? [];

  const totals = PLATFORMS.map((platform) => ({
    ...platform,
    minutes: games.reduce(
      (sum, game) => sum + Math.max(0, (game[platform.field] as number) ?? 0),
      0
    ),
  }));

  const totalMinutes = totals.reduce((sum, platform) => sum + platform.minutes, 0);

  const shares = totals
    .filter((platform) => platform.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .map(({ id, name, icon, minutes }) => {
      const percent = (minutes / totalMinutes) * 100;
      return {
        id,
        name,
        icon,
        minutes,
        hoursLabel: toHoursLabel(minutes),
        percent,
        percentLabel: toPercentLabel(percent),
      };
    });

  return {
    shares,
    totalLabel: toHoursLabel(totalMinutes),
    hasPlaytime: shares.length > 0,
  };
};
