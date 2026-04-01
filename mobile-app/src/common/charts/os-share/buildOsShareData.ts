import { OwnedGames } from "@gamelog/api-manager/dto";
import { OsPieData } from "../charts.type";
import { OS_COLORS } from "../chartsHelpers";

const buildOsShareData = (games: OwnedGames['response']['games']): OsPieData[] => {
  const totals = games.reduce(
    (acc, game) => {
      acc.Windows += game.playtime_windows_forever ?? 0;
      acc.Mac += game.playtime_mac_forever ?? 0;
      acc.Linux += game.playtime_linux_forever ?? 0;
      acc['Steam Deck'] += game.playtime_deck_forever ?? 0;
      return acc;
    },
    { Windows: 0, Mac: 0, Linux: 0, 'Steam Deck': 0 }
  );

  return (Object.entries(totals) as [string, number][])
    .filter(([, minutes]) => minutes > 0)
    .map(([platform, minutes]) => ({
      value: Math.trunc(minutes / 60),
      text: `${platform}: ${Math.trunc(minutes / 60)}h`,
      ...OS_COLORS[platform],
    }));
};

export default buildOsShareData;