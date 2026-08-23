import { OwnedGames } from '@gamelog/api-manager/dto';
import { BarData } from '../charts.type';

const buildTotalHoursBarData = (ownedGames: OwnedGames | null): BarData[] => {
  if (!ownedGames?.response?.games) return [];

  const data = ownedGames.response.games.map(
    (game: { playtime_forever: number; name: string; appid: string }) => ({
      value: Math.trunc(game.playtime_forever / 60),
      appid: game.appid,
      frontColor: '',
      gradientColor: '',
      spacing: 12,
      label: game.name.length > 10 ? game.name.slice(0, 100) + '...' : game.name,
      name: game.name, // Keep the full name for navigation
    })
  );

  const sortedData = data.sort((a, b) => b.value - a.value).slice(0, 100);

  return sortedData;
};

export default buildTotalHoursBarData;
