import { renderHook, waitFor } from '@testing-library/react-native';
import {
  useCommunityTopGamesHistogramData,
  formatHoursToDisplay,
} from '@gamelog/common/charts/community-top-games-histogram/useCommunityTopGamesHistogramData';
import ApiManager from '@gamelog/api-manager/apiManager';
import type { OwnedGames } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  __esModule: true,
  default: {
    getGameBasicInfo: jest.fn(),
  },
}));

describe('formatHoursToDisplay', () => {
  it('formats zero hours properly', () => {
    expect(formatHoursToDisplay(0)).toBe('0m');
    expect(formatHoursToDisplay(-5)).toBe('0m');
  });

  it('formats fractional hours into hours and minutes', () => {
    expect(formatHoursToDisplay(10.17)).toBe('10h 10m');
    expect(formatHoursToDisplay(14.333)).toBe('14h 20m');
    expect(formatHoursToDisplay(1.5)).toBe('1h 30m');
    expect(formatHoursToDisplay(2.0)).toBe('2h');
    expect(formatHoursToDisplay(0.5)).toBe('30m');
  });
});

describe('useCommunityTopGamesHistogramData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves game names from ownedGames when available', () => {
    const mockOwnedGames: OwnedGames = {
      response: {
        game_count: 2,
        games: [
          {
            appid: '1245620',
            name: 'Elden Ring',
            playtime_forever: 500,
            img_icon_url: '',
            has_community_visible_stats: true,
            playtime_windows_forever: 500,
            playtime_mac_forever: 0,
            playtime_linux_forever: 0,
            playtime_deck_forever: 0,
            rtime_last_played: 0,
          },
        ],
      },
    };

    const mockData = [
      { id: '1245620', user_playtime: 10.0, community_playtime: 5.0 },
    ];

    const { result } = renderHook(() =>
      useCommunityTopGamesHistogramData({
        data: mockData,
        ownedGames: mockOwnedGames,
      })
    );

    expect(result.current.hasData).toBe(true);
    expect(result.current.topGamesItems).toHaveLength(1);
    expect(result.current.topGamesItems[0].name).toBe('Elden Ring');
    expect(result.current.topGamesItems[0].userFormatted).toBe('10h');
    expect(result.current.topGamesItems[0].communityFormatted).toBe('5h');
    expect(result.current.topGamesItems[0].userPercent).toBe(100);
    expect(result.current.topGamesItems[0].communityPercent).toBe(50);
  });

  it('asynchronously fetches missing game names via ApiManager.getGameBasicInfo', async () => {
    (ApiManager.getGameBasicInfo as jest.Mock).mockResolvedValueOnce({
      '730': { data: { name: 'Counter-Strike 2' } },
    });

    const mockData = [
      { id: '730', user_playtime: 14.333, community_playtime: 8.75 },
    ];

    const { result } = renderHook(() =>
      useCommunityTopGamesHistogramData({
        data: mockData,
        ownedGames: null,
      })
    );

    await waitFor(() => {
      expect(ApiManager.getGameBasicInfo).toHaveBeenCalledWith('730');
      expect(result.current.topGamesItems[0].name).toBe('Counter-Strike 2');
    });
  });

  it('returns empty array when data is null or empty', () => {
    const { result } = renderHook(() =>
      useCommunityTopGamesHistogramData({
        data: [],
        ownedGames: null,
      })
    );

    expect(result.current.hasData).toBe(false);
    expect(result.current.topGamesItems).toEqual([]);
  });
});
