import apiManager from '@gamelog/api-manager/apiManager';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { INFO_GRADIENT_TIERS, getTopGames } from '../chartsHelpers';
import { GenreChartItem } from '../charts.type';

export const TOP_GAMES_TO_FETCH = 8;
export const TOP_GENRES_TO_SHOW = 8;


export const buildGenreChartData = async (
  games: OwnedGames['response']['games']
): Promise<GenreChartItem[]> => {
  const topGames = getTopGames(games, TOP_GAMES_TO_FETCH);
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



