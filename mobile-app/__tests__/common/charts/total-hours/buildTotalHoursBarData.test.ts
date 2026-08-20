import buildTotalHoursBarData from '@gamelog/common/charts/total-hours/buildTotalHoursBarData';
import { getPercentileInfoGradient } from '@gamelog/common/charts/chartsHelpers';
import { GameItem, OwnedGames } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  getPercentileInfoGradient: jest.fn(() => ({
    frontColor: '#computed',
    gradientColor: '#computed-g',
  })),
}));

const mockGetPercentileInfoGradient = getPercentileInfoGradient as jest.Mock;

const makeGame = (overrides: Partial<GameItem> = {}): GameItem => ({
  appid: '1',
  name: 'Test Game',
  playtime_forever: 0,
  img_icon_url: '',
  has_community_visible_stats: false,
  playtime_windows_forever: 0,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: 0,
  ...overrides,
});

const makeOwnedGames = (games: GameItem[]): OwnedGames => ({
  response: { game_count: games.length, games },
});

beforeEach(() => jest.clearAllMocks());

describe('buildTotalHoursBarData', () => {
  it('returns an empty array when ownedGames is null', () => {
    expect(buildTotalHoursBarData(null)).toEqual([]);
  });

  it('returns an empty array when response.games is missing', () => {
    expect(buildTotalHoursBarData({} as OwnedGames)).toEqual([]);
  });

  it('returns an empty array for an empty games list', () => {
    expect(buildTotalHoursBarData(makeOwnedGames([]))).toEqual([]);
  });

  it('converts playtime_forever minutes to truncated hours in value', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ playtime_forever: 150 })]));
    expect(result[0].value).toBe(2); // Math.trunc(150 / 60)
  });

  it('truncates fractional hours rather than rounding', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ playtime_forever: 119 })]));
    expect(result[0].value).toBe(1);
  });

  it('sorts results by hours descending', () => {
    const games = [
      makeGame({ appid: '1', name: 'Low', playtime_forever: 60 }),
      makeGame({ appid: '2', name: 'High', playtime_forever: 300 }),
      makeGame({ appid: '3', name: 'Mid', playtime_forever: 120 }),
    ];
    const result = buildTotalHoursBarData(makeOwnedGames(games));
    expect(result.map((r) => r.appid)).toEqual(['2', '3', '1']);
  });

  it('returns at most 100 items', () => {
    const games = Array.from({ length: 120 }, (_, i) =>
      makeGame({ appid: String(i), name: `Game ${i}`, playtime_forever: i * 60 })
    );
    const result = buildTotalHoursBarData(makeOwnedGames(games));
    expect(result).toHaveLength(100);
  });

  it('truncates names longer than 10 characters and appends "..."', () => {
    const result = buildTotalHoursBarData(
      makeOwnedGames([makeGame({ name: 'A Very Long Game Name' })])
    );
    expect(result[0].label).toMatch(/\.\.\.$/);
  });

  it('keeps names of 10 characters or fewer unchanged', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ name: 'ShortName' })]));
    expect(result[0].label).toBe('ShortName');
  });

  it('calls getPercentileInfoGradient with value, min, and max for each item', () => {
    const games = [
      makeGame({ appid: '1', playtime_forever: 60 }),
      makeGame({ appid: '2', playtime_forever: 180 }),
    ];
    buildTotalHoursBarData(makeOwnedGames(games));

    expect(mockGetPercentileInfoGradient).toHaveBeenCalledWith(3, 1, 3); // max item
    expect(mockGetPercentileInfoGradient).toHaveBeenCalledWith(1, 1, 3); // min item
  });

  it('spreads getPercentileInfoGradient result onto each bar item', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ playtime_forever: 60 })]));
    expect(result[0].frontColor).toBe('#computed');
    expect(result[0].gradientColor).toBe('#computed-g');
  });

  it('sets spacing to 12 on every item', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ playtime_forever: 60 })]));
    expect(result[0].spacing).toBe(12);
  });
});
