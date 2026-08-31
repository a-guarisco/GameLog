import { OwnedGames } from '@gamelog/api-manager/dto';
export interface BarData {
  value: number;
  appid: string;
  frontColor: string;
  gradientColor: string;
  label: string;
}

const buildTotalHoursBarData = (ownedGames: OwnedGames | null): BarData[] => {
  if (!ownedGames?.response?.games) return [];

  const data = ownedGames.response.games
    .filter((game: { playtime_forever: number }) => game.playtime_forever > 0)
    .map((game: { playtime_forever: number; name: string; appid: string }) => ({
      value: game.playtime_forever,
      appid: String(game.appid),
      frontColor: '',
      gradientColor: '',
      label: game.name,
      name: game.name,
    }));

  const sortedData = data.sort((a, b) => b.value - a.value).slice(0, 100);

  return sortedData;
};

export default buildTotalHoursBarData;
