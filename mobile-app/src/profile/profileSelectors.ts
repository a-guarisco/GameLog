import type { GameItem, OwnedGames } from '@gamelog/api-manager/dto';
import type { GameStat } from '@gamelog/common/StatBand';
import { formatMinutesToHoursShort, formatThousands } from '@gamelog/utils/formatUtils';

const getGames = (ownedGames?: OwnedGames | null): GameItem[] => ownedGames?.response?.games ?? [];

/** Truncates like formatMinutesToHoursShort, so the band and the top-games rows never disagree. */
const toHours = (minutes: number) => Math.floor(minutes / 60);

/** The library's centrepiece: its artwork becomes the profile hero. */
export const getMostPlayedGame = (ownedGames?: OwnedGames | null): GameItem | null =>
  getGames(ownedGames).reduce<GameItem | null>(
    (best, game) => (!best || game.playtime_forever > best.playtime_forever ? game : best),
    null
  );

/**
 * Owned / hours in the last two weeks / lifetime hours. `game_count` is the authoritative
 * library size — `games` can be shorter when the payload is filtered — so it wins when
 * Steam sends it. `recentMinutes` comes from the backend playtime report, since Steam's
 * owned-games payload carries no recent window.
 */
export const getProfileStats = (
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
  /** 0–100, relative to the most played game so the longest bar always fills the track. */
  percentOfTop: number;
}

const TOP_GAMES_COUNT = 5;

/** Never-played games are dropped: a row of empty tracks says nothing about a library. */
export const getTopGamesByHours = (
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
export const getMemberSinceLabel = (timecreated?: number | null): string | null =>
  timecreated ? `Since ${new Date(timecreated * 1000).getFullYear()}` : null;
