import { brand } from '@gamelog/theme/theme';
import { OwnedGames } from '@gamelog/api-manager/dto';

export const INFO_GRADIENT_TIERS: { frontColor: string; gradientColor: string }[] = [
  { frontColor: `rgb(${brand.info['0']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['100']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['200']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['300']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['400']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['500']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['600']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['700']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['800']})`, gradientColor: `rgb(${brand.info['500']})` },
  { frontColor: `rgb(${brand.info['900']})`, gradientColor: `rgb(${brand.info['500']})` },
];

export const OS_COLORS: Record<string, { color: string; gradientCenterColor: string }> = {
  Windows: {
    color: `rgb(${brand.info['700']})`,
    gradientCenterColor: `rgb(${brand.info['500']})`,
  },
  Mac: {
    color: `rgb(${brand.info['400']})`,
    gradientCenterColor: `rgb(${brand.info['200']})`,
  },
  Linux: {
    color: `rgb(${brand.info['900']})`,
    gradientCenterColor: `rgb(${brand.info['700']})`,
  },
  'Steam Deck': {
    color: `rgb(${brand.info['200']})`,
    gradientCenterColor: `rgb(${brand.info['100']})`,
  },
};

export const getPercentileInfoGradient = (
  value: number,
  min: number,
  max: number
): { frontColor: string; gradientColor: string } => {
  const range = max - min;
  const percentile = range === 0 ? 1 : (value - min) / range;

  const tierIndex =
    percentile < 0.1
      ? 0
      : percentile < 0.2
        ? 1
        : percentile < 0.3
          ? 2
          : percentile < 0.4
            ? 4
            : percentile < 0.5
              ? 5
              : percentile < 0.6
                ? 6
                : percentile < 0.7
                  ? 7
                  : percentile < 0.8
                    ? 8
                    : 9;

  return INFO_GRADIENT_TIERS[tierIndex];
};

export const computePieRadius = (cardWidth: number) =>
  cardWidth > 0 ? Math.floor(cardWidth * 0.28) : 110;
export const computePieInnerRadius = (r: number) => Math.floor(r * 0.64);

export const getTopGames = (games: OwnedGames['response']['games'], gamesToFetch: number) => {
  return [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, gamesToFetch);
};
