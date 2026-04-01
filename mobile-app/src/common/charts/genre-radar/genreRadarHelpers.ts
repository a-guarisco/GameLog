import apiManager from '@gamelog/api-manager/apiManager';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { INFO_GRADIENT_TIERS } from '../chartsHelpers';

export const TOP_GAMES_TO_FETCH = 8;
export const TOP_GENRES_TO_SHOW = 8;

export interface GenreChartItem {
  label: string;
  value: number;
  color: string;
}

export const buildGenreChartData = async (
  games: OwnedGames['response']['games']
): Promise<GenreChartItem[]> => {
  const topGames = getTopGames(games);
  const genreMinutes: Record<string, number> = {};

  await Promise.all(
    topGames.map(async (game) => {
      try {
        const raw = await apiManager.getGameGenres(String(game.appid));
        const appData = (raw as any)?.[game.appid];
        const genres = (appData?.data?.genres ?? []).map(
          (g: { description: string }) => g.description
        );
        genres.forEach((genre: any) => {
          genreMinutes[genre] = (genreMinutes[genre] ?? 0) + game.playtime_forever;
        });
      } catch {
        return [];
      }
    })
  );

  return Object.entries(genreMinutes)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_GENRES_TO_SHOW)
    .map((item, i) => ({
      ...item,
      color: INFO_GRADIENT_TIERS[i % INFO_GRADIENT_TIERS.length].frontColor,
    }));
};

const getTopGames = (games: OwnedGames['response']['games']) => {
  return [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, TOP_GAMES_TO_FETCH);
};

export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
