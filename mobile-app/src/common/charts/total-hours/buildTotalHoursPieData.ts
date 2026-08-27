import { OwnedGames } from '@gamelog/api-manager/dto';
import { parseRGB } from '../chartsHelpers';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import { tailwindColors } from '@gamelog/theme/theme';
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

  // A vibrant, highly saturated 6-color palette inspired by the infographic
  const GRADIENT_PALETTE = [
    { color: tailwindColors.blue[600], gradient: tailwindColors.blue[400] },
    { color: tailwindColors.violet[600], gradient: tailwindColors.violet[400] },
    { color: tailwindColors.fuchsia[600], gradient: tailwindColors.fuchsia[400] },
    { color: tailwindColors.orange[600], gradient: tailwindColors.orange[400] },
    { color: tailwindColors.lime[600], gradient: tailwindColors.lime[400] },
    { color: tailwindColors.emerald[600], gradient: tailwindColors.emerald[400] },
  ];

  const slices: PieData[] = rawSlices.map((slice, i) => {
    const palette = GRADIENT_PALETTE[i % GRADIENT_PALETTE.length];
    return {
      ...slice,
      color: parseRGB(palette.color),
      gradientCenterColor: parseRGB(palette.gradient),
    };
  });

  return slices;
};

export default buildTotalHoursPieData;
