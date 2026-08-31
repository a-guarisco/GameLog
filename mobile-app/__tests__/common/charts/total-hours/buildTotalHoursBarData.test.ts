import buildTotalHoursBarData from '@gamelog/common/charts/total-hours/buildTotalHoursBarData';
import { GameItem, OwnedGames } from '@gamelog/api-manager/dto';

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

  it('preserves playtime_forever minutes in value', () => {
    const result = buildTotalHoursBarData(makeOwnedGames([makeGame({ playtime_forever: 150 })]));
    expect(result[0].value).toBe(150);
  });

  it('filters out games with zero playtime', () => {
    const games = [
      makeGame({ appid: '1', name: 'Played', playtime_forever: 60 }),
      makeGame({ appid: '2', name: 'Unplayed', playtime_forever: 0 }),
    ];
    const result = buildTotalHoursBarData(makeOwnedGames(games));
    expect(result).toHaveLength(1);
    expect(result[0].appid).toBe('1');
  });

  it('sorts results by playtime descending', () => {
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
      makeGame({ appid: String(i + 1), name: `Game ${i}`, playtime_forever: (i + 1) * 60 })
    );
    const result = buildTotalHoursBarData(makeOwnedGames(games));
    expect(result).toHaveLength(100);
  });

  it('preserves game name in label', () => {
    const result = buildTotalHoursBarData(
      makeOwnedGames([makeGame({ name: 'A Very Long Game Name', playtime_forever: 60 })])
    );
    expect(result[0].label).toBe('A Very Long Game Name');
  });
});
