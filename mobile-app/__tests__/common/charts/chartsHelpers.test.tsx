import {
  computePieInnerRadius,
  computePieRadius,
  getPercentileInfoGradient,
  getTopGames,
  INFO_GRADIENT_TIERS,
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

const makeGame = (name: string, minutes: number) => ({
  name,
  playtime_forever: minutes,
});

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

describe('computePieRadius', () => {
  it('should return the calculated radius when cardWidth is greater than 0', () => {
    const cardWidth = 400;
    expect(computePieRadius(cardWidth)).toBe(112);
  });

  it('should return 110 when cardWidth is 0 or less', () => {
    expect(computePieRadius(0)).toBe(110);
    expect(computePieRadius(-10)).toBe(110);
  });
});

describe('computePieInnerRadius', () => {
  it('should return the calculated inner radius when given r', () => {
    const r = 200;
    expect(computePieInnerRadius(r)).toBe(128);
  });
});

describe('getTopGames', () => {
  it('returns empty array when no games', () => {
    expect(getTopGames([], 5)).toEqual([]);
  });

  it('filters out games with zero playtime', () => {
    const games = [makeGame('A', 0), makeGame('B', 10)];

    const result = getTopGames(games as any, 5);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('B');
  });

  it('sorts games by playtime descending', () => {
    const games = [makeGame('A', 10), makeGame('B', 30), makeGame('C', 20)];

    const result = getTopGames(games as any, 5);

    expect(result.map((g) => g.name)).toEqual(['B', 'C', 'A']);
  });

  it('limits results to gamesToFetch', () => {
    const games = [makeGame('A', 10), makeGame('B', 30), makeGame('C', 20)];

    const result = getTopGames(games as any, 2);

    expect(result).toHaveLength(2);
    expect(result.map((g) => g.name)).toEqual(['B', 'C']);
  });

  it('returns fewer items if not enough valid games', () => {
    const games = [makeGame('A', 10)];

    const result = getTopGames(games as any, 5);

    expect(result).toHaveLength(1);
  });

  it('does not mutate the original array', () => {
    const games = [makeGame('A', 10), makeGame('B', 20)];

    const original = [...games];

    getTopGames(games as any, 1);

    expect(games).toEqual(original);
  });
});
