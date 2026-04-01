import { OwnedGames } from "@gamelog/api-manager/dto";
import { BarData } from "../charts.type";
import { getPercentileInfoGradient } from "../chartsHelpers";

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
    })
  );

  const sortedData = data.sort((a, b) => b.value - a.value).slice(0, 100);
  const min = Math.min(...sortedData.map((d) => d.value));
  const max = Math.max(...sortedData.map((d) => d.value));

  return sortedData.map((item) => ({
    ...item,
    ...getPercentileInfoGradient(item.value, min, max),
  }));
};

export default buildTotalHoursBarData;