import type { GameItem, OwnedGames } from '@gamelog/api-manager/dto';
import { formatThousands } from '@gamelog/utils/formatUtils';

export interface PlatformShare {
  id: string;
  name: string;
  icon: string;
  minutes: number;
  hoursLabel: string;
  percent: number;
  percentLabel: string;
}

export interface PlatformSplit {
  shares: PlatformShare[];
  totalLabel: string;
  hasPlaytime: boolean;
}

export const PLATFORMS: { id: string; name: string; icon: string; field: keyof GameItem }[] = [
  { id: 'windows', name: 'Windows', icon: 'logo-windows', field: 'playtime_windows_forever' },
  { id: 'deck', name: 'Steam Deck', icon: 'logo-steam', field: 'playtime_deck_forever' },
  { id: 'linux', name: 'Linux', icon: 'logo-tux', field: 'playtime_linux_forever' },
  { id: 'mac', name: 'macOS', icon: 'logo-apple', field: 'playtime_mac_forever' },
];

const toHoursLabel = (minutes: number) => `${formatThousands(Math.floor(minutes / 60))}h`;

const toPercentLabel = (percent: number) => {
  const rounded = Math.round(percent);
  return rounded === 0 ? '<1%' : `${rounded}%`;
};

export const selectPlatformSplit = (ownedGames?: OwnedGames | null): PlatformSplit => {
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
