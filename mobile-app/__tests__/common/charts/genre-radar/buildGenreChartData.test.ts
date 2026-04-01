import {
  buildGenreChartData,
  TOP_GAMES_TO_FETCH,
  TOP_GENRES_TO_SHOW,
} from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import apiManager from '@gamelog/api-manager/apiManager';
import { getTopGames, INFO_GRADIENT_TIERS } from '@gamelog/common/charts/chartsHelpers';
import { GameItem } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  getTopGames: jest.fn(),
  INFO_GRADIENT_TIERS: [
    { frontColor: '#color0' },
    { frontColor: '#color1' },
    { frontColor: '#color2' },
  ],
}));

const mockGetTopGames = getTopGames as jest.Mock;
const mockGetGameGenres = apiManager.getGameGenres as jest.Mock;

const makeGame = (appid: number, playtime_forever: number): GameItem => ({
  appid: String(appid),
  name: `Game ${appid}`,
  playtime_forever,
  img_icon_url: '',
  has_community_visible_stats: false,
  playtime_windows_forever: 0,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: 0,
});

const makeGenreResponse = (appid: string, genres: string[]) => ({
  [appid]: { data: { genres: genres.map((description) => ({ description })) } },
});

beforeEach(() => jest.clearAllMocks());

describe('buildGenreChartData', () => {
  it('returns an empty array when there are no top games', async () => {
    mockGetTopGames.mockReturnValue([]);

    const result = await buildGenreChartData([]);

    expect(result).toEqual([]);
  });

  it('calls getTopGames with the provided games and TOP_GAMES_TO_FETCH', async () => {
    const games = [makeGame(1, 100)];
    mockGetTopGames.mockReturnValue([]);

    await buildGenreChartData(games);

    expect(mockGetTopGames).toHaveBeenCalledWith(games, TOP_GAMES_TO_FETCH);
  });

  it('accumulates playtime per genre across multiple games', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 60), makeGame(2, 40)]);
    mockGetGameGenres
      .mockResolvedValueOnce(makeGenreResponse('1', ['Action']))
      .mockResolvedValueOnce(makeGenreResponse('2', ['Action']));

    const result = await buildGenreChartData([]);

    const action = result.find((r) => r.label === 'Action');
    expect(action?.value).toBe(100);
  });

  it('keeps genres separate when games have different genres', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 60), makeGame(2, 40)]);
    mockGetGameGenres
      .mockResolvedValueOnce(makeGenreResponse('1', ['Action']))
      .mockResolvedValueOnce(makeGenreResponse('2', ['RPG']));

    const result = await buildGenreChartData([]);

    expect(result.find((r) => r.label === 'Action')?.value).toBe(60);
    expect(result.find((r) => r.label === 'RPG')?.value).toBe(40);
  });

  it('sorts results by playtime descending', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 10), makeGame(2, 200), makeGame(3, 50)]);
    mockGetGameGenres
      .mockResolvedValueOnce(makeGenreResponse('1', ['Indie']))
      .mockResolvedValueOnce(makeGenreResponse('2', ['Action']))
      .mockResolvedValueOnce(makeGenreResponse('3', ['RPG']));

    const result = await buildGenreChartData([]);

    expect(result.map((r) => r.label)).toEqual(['Action', 'RPG', 'Indie']);
  });

  it(`returns at most TOP_GENRES_TO_SHOW (${TOP_GENRES_TO_SHOW}) items`, async () => {
    const games = Array.from({ length: 10 }, (_, i) => makeGame(i + 1, 100));
    mockGetTopGames.mockReturnValue(games);
    games.forEach((g) =>
      mockGetGameGenres.mockResolvedValueOnce(makeGenreResponse(g.appid, [`Genre${g.appid}`]))
    );

    const result = await buildGenreChartData([]);

    expect(result.length).toBeLessThanOrEqual(TOP_GENRES_TO_SHOW);
  });

  it('assigns a frontColor from INFO_GRADIENT_TIERS to each item', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 100), makeGame(2, 50)]);
    mockGetGameGenres
      .mockResolvedValueOnce(makeGenreResponse('1', ['Action']))
      .mockResolvedValueOnce(makeGenreResponse('2', ['RPG']));

    const result = await buildGenreChartData([]);

    expect(result[0].color).toBe(INFO_GRADIENT_TIERS[0].frontColor);
    expect(result[1].color).toBe(INFO_GRADIENT_TIERS[1].frontColor);
  });

  it('wraps around INFO_GRADIENT_TIERS colors when there are more items than tiers', async () => {
    const tiersLength = INFO_GRADIENT_TIERS.length;
    const games = Array.from({ length: tiersLength + 1 }, (_, i) => makeGame(i + 1, 100 - i));
    mockGetTopGames.mockReturnValue(games);
    games.forEach((g) =>
      mockGetGameGenres.mockResolvedValueOnce(makeGenreResponse(g.appid, [`Genre${g.appid}`]))
    );

    const result = await buildGenreChartData([]);

    expect(result[tiersLength].color).toBe(INFO_GRADIENT_TIERS[0].frontColor);
  });

  it('skips a game gracefully when the API call rejects', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 100), makeGame(2, 50)]);
    mockGetGameGenres
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(makeGenreResponse('2', ['RPG']));

    const result = await buildGenreChartData([]);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('RPG');
  });

  it('handles a game whose API response has no genres array', async () => {
    mockGetTopGames.mockReturnValue([makeGame(1, 100)]);
    mockGetGameGenres.mockResolvedValueOnce({ 1: { data: {} } });

    const result = await buildGenreChartData([]);

    expect(result).toEqual([]);
  });
});
