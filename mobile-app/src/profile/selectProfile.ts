import type { GameItem, OwnedGames } from '@gamelog/api-manager/dto';
import type { GameStat } from '@gamelog/common/StatBand';
import { formatMinutesToHoursShort, formatThousands } from '@gamelog/utils/formatUtils';

const getGames = (ownedGames?: OwnedGames | null): GameItem[] => ownedGames?.response?.games ?? [];

const toHours = (minutes: number) => Math.floor(minutes / 60);

export const selectMostPlayedGame = (ownedGames?: OwnedGames | null): GameItem | null =>
  getGames(ownedGames).reduce<GameItem | null>(
    (best, game) => (!best || game.playtime_forever > best.playtime_forever ? game : best),
    null
  );

export const selectProfileStats = (
  ownedGames?: OwnedGames | null,
  recentMinutes: number = 0
): GameStat[] => {
  const games = getGames(ownedGames);
  const ownedCount = ownedGames?.response?.game_count ?? games.length;
  const totalHours = toHours(games.reduce((sum, game) => sum + (game.playtime_forever ?? 0), 0));

  return [
    { value: formatThousands(ownedCount), label: 'Owned' },
    { value: `${formatThousands(toHours(recentMinutes))} h`, label: '2 weeks' },
    { value: `${formatThousands(totalHours)} h`, label: 'Total' },
  ];
};

export interface TopGame {
  appid: string;
  name: string;
  hoursLabel: string;
  percentOfTop: number;
}

const TOP_GAMES_COUNT = 5;

export const selectTopGamesByHours = (
  ownedGames?: OwnedGames | null,
  limit: number = TOP_GAMES_COUNT
): TopGame[] => {
  const played = getGames(ownedGames).filter((game) => (game.playtime_forever ?? 0) > 0);
  const ranked = [...played]
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, Math.max(0, limit));

  if (ranked.length === 0) return [];

  const topMinutes = ranked[0].playtime_forever;

  return ranked.map((game) => ({
    appid: game.appid,
    name: game.name,
    hoursLabel: formatMinutesToHoursShort(game.playtime_forever),
    percentOfTop: (game.playtime_forever / topMinutes) * 100,
  }));
};

/** Steam sends `timecreated` in seconds; accounts predating the field simply have no chip. */
export const selectMemberSinceLabel = (timecreated?: number | null): string | null =>
  timecreated ? `Since ${new Date(timecreated * 1000).getFullYear()}` : null;
