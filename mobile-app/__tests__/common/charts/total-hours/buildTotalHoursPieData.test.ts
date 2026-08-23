import buildTotalHoursPieData from '@gamelog/common/charts/total-hours/buildTotalHoursPieData';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  parseRGB: (c: any) => c ? `rgb(${String(c).replace(/ /g, ',')})` : 'transparent',
}));

jest.mock('@gamelog/utils/formatUtils', () => ({
  formatMinutesToHours: jest.fn((m) => `${m}m`),
}));

const makeGame = (name: string, minutes: number) => ({
  name,
  playtime_forever: minutes,
});

describe('buildTotalHoursPieData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when ownedGames is null', () => {
    const result = buildTotalHoursPieData(null, 5);
    expect(result).toEqual([]);
  });

  it('returns empty array when no games exist', () => {
    const result = buildTotalHoursPieData({ response: { games: [] } } as any, 5);
    expect(result).toEqual([]);
  });

  it('sorts and maps games to pie slices with correct values and colors', () => {
    // A has 60, B has 40. B is defined before A to test sorting.
    const games = [makeGame('Game B', 40), makeGame('Game A', 60)];

    const result = buildTotalHoursPieData({ response: { games } } as any, 5);

    expect(result).toEqual([
      {
        value: 60,
        label: 'Game A',
        text: '60m',
        color: 'rgb(37,99,235)',
        gradientCenterColor: 'rgb(96,165,250)',
      },
      {
        value: 40,
        label: 'Game B',
        text: '40m',
        color: 'rgb(124,58,237)',
        gradientCenterColor: 'rgb(167,139,250)',
      },
    ]);
  });

  it('cycles through gradient tiers when more games than colors', () => {
    const games = Array.from({ length: 8 }, (_, i) => makeGame(`Game ${i}`, 100 - i));

    const result = buildTotalHoursPieData({ response: { games } } as any, 8);

    // Color at index 6 should loop back to color at index 0 (Blue)
    expect(result[6].color).toBe('rgb(37,99,235)');
    expect(result[6].gradientCenterColor).toBe('rgb(96,165,250)');
  });

  it('adds "Other" slice when there are more games than limit', () => {
    const games = [makeGame('A', 30), makeGame('B', 20), makeGame('C', 10)];

    const result = buildTotalHoursPieData({ response: { games } } as any, 2);

    const otherSlice = result.find((r) => r.label === 'Other');

    expect(otherSlice).toEqual({
      value: 10,
      label: 'Other',
      text: '10m',
      color: 'rgb(192,38,211)', // 3rd color in the palette (Fuchsia)
      gradientCenterColor: 'rgb(232,121,249)',
    });
  });

  it('does not add "Other" slice when extra games sum to 0', () => {
    const games = [makeGame('A', 10), makeGame('B', 20), makeGame('C', 0)];

    const result = buildTotalHoursPieData({ response: { games } } as any, 2);

    expect(result.find((r) => r.label === 'Other')).toBeUndefined();
  });

  it('correctly sums extra games into "Other"', () => {
    const games = [makeGame('A', 40), makeGame('B', 30), makeGame('C', 20), makeGame('D', 10)];

    const result = buildTotalHoursPieData({ response: { games } } as any, 2);

    const otherSlice = result.find((r) => r.label === 'Other');

    expect(otherSlice?.value).toBe(30); // C + D
  });
});
