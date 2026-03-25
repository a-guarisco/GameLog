import { brand } from '@gamelog/theme/theme';

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
