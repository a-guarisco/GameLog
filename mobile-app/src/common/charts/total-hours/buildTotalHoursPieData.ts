import { OwnedGames } from '@gamelog/api-manager/dto';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import { CHART_GRADIENT_PALETTE } from '@gamelog/theme/hexColors';

export interface PieData {
  value: number;
  color: string;
  gradientCenterColor: string;
  label: string;
}

const buildTotalHoursPieData = (
  ownedGames: OwnedGames | null,
  gameToRepresent: number
): PieData[] => {
  if (!ownedGames?.response?.games) return [];

  const games = ownedGames.response.games;

  const allPlayed = [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever);

  const top = allPlayed.slice(0, gameToRepresent);
  const otherMinutes = allPlayed
    .slice(gameToRepresent)
    .reduce((sum, g) => sum + g.playtime_forever, 0);

  const rawSlices = top.map((game) => {
    return {
      value: game.playtime_forever,
      label: game.name, // Pass the full name, allow UI to truncate dynamically
      text: formatMinutesToHours(game.playtime_forever), // For the pie slice
    };
  });

  if (otherMinutes > 0) {
    rawSlices.push({
      value: otherMinutes,
      label: 'Other',
      text: formatMinutesToHours(otherMinutes),
    });
  }

  const slices: PieData[] = rawSlices.map((slice, i) => {
    const palette = CHART_GRADIENT_PALETTE[i % CHART_GRADIENT_PALETTE.length];
    return {
      ...slice,
      color: palette.color,
      gradientCenterColor: palette.gradient,
    };
  });

  return slices;
};

export default buildTotalHoursPieData;
