import { OwnedGames } from '@gamelog/api-manager/dto';
import { getTopGames, INFO_GRADIENT_TIERS } from '../chartsHelpers';
import { brand } from '@gamelog/theme/theme';
import { PieData } from '../charts.type';

const buildTotalHoursPieData = (
  ownedGames: OwnedGames | null,
  gameToRepresent: number
): PieData[] => {
  if (!ownedGames?.response?.games) return [];

  const games = ownedGames.response.games;

  const top = getTopGames(games, gameToRepresent) ?? [];

  const otherMinutes = top.slice(gameToRepresent).reduce((sum, g) => sum + g.playtime_forever, 0);

  const slices: PieData[] = top.map((game, i) => ({
    value: game.playtime_forever,
    label: game.name.length > 12 ? game.name.slice(0, 12) + '…' : game.name,
    color: INFO_GRADIENT_TIERS[i % INFO_GRADIENT_TIERS.length].frontColor,
    gradientCenterColor: INFO_GRADIENT_TIERS[i % INFO_GRADIENT_TIERS.length].gradientColor,
  }));

  if (otherMinutes > 0) {
    slices.push({
      value: otherMinutes,
      label: 'Other',
      color: `rgb(${brand.info['200']})`,
      gradientCenterColor: `rgb(${brand.info['400']})`,
    });
  }

  return slices;
};

export default buildTotalHoursPieData;
