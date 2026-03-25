import {
  getPercentileInfoGradient,
  INFO_GRADIENT_TIERS,
  OS_COLORS,
} from '@gamelog/common/charts/chartsHelpers';

jest.mock('@gamelog/theme/theme', () => ({
  brand: {
    info: {
      '0': '0,0,255',
      '100': '0,10,255',
      '200': '0,20,255',
      '300': '0,30,255',
      '400': '0,40,255',
      '500': '0,50,255',
      '600': '0,60,255',
      '700': '0,70,255',
      '800': '0,80,255',
      '900': '0,90,255',
    },
  },
}));

describe('INFO_GRADIENT_TIERS', () => {
  it('has 10 tiers', () => {
    expect(INFO_GRADIENT_TIERS).toHaveLength(10);
  });

  it('each tier has frontColor and gradientColor', () => {
    INFO_GRADIENT_TIERS.forEach((tier) => {
      expect(tier).toHaveProperty('frontColor');
      expect(tier).toHaveProperty('gradientColor');
    });
  });
});

describe('OS_COLORS', () => {
  it('contains entries for all expected platforms', () => {
    ['Windows', 'Mac', 'Linux', 'Steam Deck'].forEach((os) => {
      expect(OS_COLORS[os]).toHaveProperty('color');
      expect(OS_COLORS[os]).toHaveProperty('gradientCenterColor');
    });
  });
});

describe('getPercentileInfoGradient', () => {
  it('returns tier 0 when value is at the minimum (percentile < 0.1)', () => {
    const result = getPercentileInfoGradient(0, 0, 100);
    expect(result).toEqual(INFO_GRADIENT_TIERS[0]);
  });

  it('returns tier 1 for percentile in [0.1, 0.2)', () => {
    const result = getPercentileInfoGradient(15, 0, 100);
    expect(result).toEqual(INFO_GRADIENT_TIERS[1]);
  });

  it('returns tier 9 for percentile >= 0.8', () => {
    const result = getPercentileInfoGradient(90, 0, 100);
    expect(result).toEqual(INFO_GRADIENT_TIERS[9]);
  });

  it('returns tier 9 for the maximum value', () => {
    const result = getPercentileInfoGradient(100, 0, 100);
    expect(result).toEqual(INFO_GRADIENT_TIERS[9]);
  });

  it('returns tier 1 (percentile = 1) when min === max (zero range)', () => {
    const result = getPercentileInfoGradient(50, 50, 50);
    expect(result).toEqual(INFO_GRADIENT_TIERS[9]);
  });
});
