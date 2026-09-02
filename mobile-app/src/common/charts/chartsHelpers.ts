import { brand } from '@gamelog/theme/theme';
import { OwnedGames } from '@gamelog/api-manager/dto';
export const parseRGB = (colorStr?: string | number) => {
  if (!colorStr) return 'transparent';
  return `rgb(${String(colorStr).replace(/ /g, ',')})`;
};

export const INFO_GRADIENT_TIERS: { frontColor: string; gradientColor: string }[] = [
  { frontColor: parseRGB(brand.info['0']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['100']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['200']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['300']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['400']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['500']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['600']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['700']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['800']), gradientColor: parseRGB(brand.info['500']) },
  { frontColor: parseRGB(brand.info['900']), gradientColor: parseRGB(brand.info['500']) },
];

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

export const computePieRadius = (cardWidth: number, isLandscape = false) => {
  if (cardWidth <= 0) return 140;
  if (isLandscape) {
    // In landscape, scale comfortably up to 145px (diameter ~280-290px)
    // so all 5 games are prominently displayed with plenty of space in the center hole,
    // while remaining well-proportioned within the card.
    return Math.min(145, Math.max(130, Math.floor(cardWidth * 0.18)));
  }
  // In portrait, scale with card width capped at 140px
  return Math.min(140, Math.floor(cardWidth * 0.45));
};
export const computePieInnerRadius = (r: number) => Math.floor(r * 0.7);

export const getTopGames = (games: OwnedGames['response']['games'], gamesToFetch: number) => {
  return [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, gamesToFetch);
};
