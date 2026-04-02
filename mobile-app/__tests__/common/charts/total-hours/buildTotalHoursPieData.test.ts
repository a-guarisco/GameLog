import buildTotalHoursPieData from '@gamelog/common/charts/total-hours/buildTotalHoursPieData';
import { getTopGames } from '@gamelog/common/charts/chartsHelpers';
import { brand } from '@gamelog/theme/theme';

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  getTopGames: jest.fn(),
  INFO_GRADIENT_TIERS: [
    { frontColor: '#a', gradientColor: '#b' },
    { frontColor: '#c', gradientColor: '#d' },
  ],
}));

const mockGetTopGames = getTopGames as jest.Mock;

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

  it('calls getTopGames with games and limit', () => {
    const games = [makeGame('A', 10)];
    mockGetTopGames.mockReturnValue(games);

    buildTotalHoursPieData({ response: { games } } as any, 3);

    expect(mockGetTopGames).toHaveBeenCalledWith(games, 3);
  });

  it('maps games to pie slices with correct values and colors', () => {
    const games = [makeGame('Game A', 60), makeGame('Game B', 40)];
    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 5);

    expect(result).toEqual([
      {
        value: 60,
        label: 'Game A',
        color: '#a',
        gradientCenterColor: '#b',
      },
      {
        value: 40,
        label: 'Game B',
        color: '#c',
        gradientCenterColor: '#d',
      },
    ]);
  });

  it('truncates long game names to 12 chars + ellipsis', () => {
    const games = [makeGame('VeryLongGameName123', 50)];
    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 5);

    expect(result[0].label).toBe('VeryLongGame…');
  });

  it('cycles through gradient tiers when more games than colors', () => {
    const games = [
      makeGame('A', 10),
      makeGame('B', 20),
      makeGame('C', 30), // should reuse first color
    ];
    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 5);

    expect(result[2].color).toBe('#a');
    expect(result[2].gradientCenterColor).toBe('#b');
  });

  it('adds "Other" slice when there are more games than limit', () => {
    const games = [makeGame('A', 10), makeGame('B', 20), makeGame('C', 30)];

    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 2);

    const otherSlice = result.find((r) => r.label === 'Other');

    expect(otherSlice).toEqual({
      value: 30,
      label: 'Other',
      color: `rgb(${brand.info['200']})`,
      gradientCenterColor: `rgb(${brand.info['400']})`,
    });
  });

  it('does not add "Other" slice when extra games sum to 0', () => {
    const games = [makeGame('A', 10), makeGame('B', 20)];

    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 5);

    expect(result.find((r) => r.label === 'Other')).toBeUndefined();
  });

  it('correctly sums extra games into "Other"', () => {
    const games = [makeGame('A', 10), makeGame('B', 20), makeGame('C', 30), makeGame('D', 40)];

    mockGetTopGames.mockReturnValue(games);

    const result = buildTotalHoursPieData({ response: { games } } as any, 2);

    const otherSlice = result.find((r) => r.label === 'Other');

    expect(otherSlice?.value).toBe(70);
  });
});
