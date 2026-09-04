import { renderHook, act } from '@testing-library/react-native';
import { useGameViewData, toGameScreenshots } from '@gamelog/game/useGameViewData';
import { useGetPlaytimeReport } from '@gamelog/api-manager/useApi';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

const mockRefetchGameStreak = jest.fn().mockResolvedValue(undefined);
const mockRefetchGlobalAchievements = jest.fn().mockResolvedValue(undefined);
const mockRefetchScreenshots = jest.fn().mockResolvedValue(undefined);
const mockRefetchCurrentPlayers = jest.fn().mockResolvedValue(undefined);
const mockRefetchPlaytimeReport = jest.fn().mockResolvedValue(undefined);
const mockRefetchGameStatus = jest.fn().mockResolvedValue(undefined);
const mockRefetchAchievements = jest.fn().mockResolvedValue(undefined);

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameStreak: jest.fn(() => ({
    gameStreak: { streak: 5 },
    isLoadingGameStreak: false,
    refetchGameStreak: mockRefetchGameStreak,
  })),
  useGetGlobalAchievement: jest.fn(() => ({
    globalAchievements: [],
    refetchGlobalAchievements: mockRefetchGlobalAchievements,
  })),
  useGetGameScreenshots: jest.fn(() => ({
    screenshots: [],
    totalScreenshots: 0,
    loadMoreScreenshots: jest.fn(),
    isLoadingScreenshots: false,
    isLoadingMoreScreenshots: false,
    refetchScreenshots: mockRefetchScreenshots,
  })),
  useGetNumberOfCurrentPlayers: jest.fn(() => ({
    currentPlayers: { response: { player_count: 1234 } },
    refetchCurrentPlayers: mockRefetchCurrentPlayers,
  })),
  useGetPlaytimeReport: jest.fn(() => ({
    playtimeReport: {
      date: '2026-08-18',
      game_reports: [{ app_id: '413150', today_play_time: 180, streak: 2 }],
    },
    isLoadingPlaytimeReport: false,
    refetchPlaytimeReport: mockRefetchPlaytimeReport,
  })),
  useGetGameStatus: jest.fn(() => ({
    gameStatus: 'playing',
    isLoadingGameStatus: false,
    refetchGameStatus: mockRefetchGameStatus,
  })),
}));

jest.mock('@gamelog/game/useAchievementsData', () =>
  jest.fn(() => ({
    unlockedCount: 10,
    totalCount: 20,
    completionPercent: 50,
    refetchAchievements: mockRefetchAchievements,
  }))
);

describe('useGameViewData', () => {
  const gameItem = {
    appid: '413150',
    name: 'Stardew Valley',
    playtime_forever: 120,
    playtime_2weeks: 60,
    rtime_last_played: 1620000000,
  };

  it('transforms PublishedFileDetails into GameScreenshot items correctly', () => {
    const files: PublishedFileDetails[] = [
      {
        publishedfileid: '1',
        creator: '123',
        consumer_appid: 413150,
        title: 'Farm View',
        short_description: 'Sunset on the farm',
        image_url: 'http://example.com/farm.jpg',
        preview_url: '',
        image_width: 1920,
        image_height: 1080,
        time_created: 100,
        file_type: 5,
      },
    ];

    const mapped = toGameScreenshots(files);
    expect(mapped).toEqual([
      { id: '1', imageUrl: 'http://example.com/farm.jpg', caption: 'Sunset on the farm' },
    ]);
  });

  it('aggregates game view stats and data correctly', () => {
    const { result } = renderHook(() => useGameViewData(gameItem, 'player-1'));

    expect(result.current.livePlayers).toBe(1234);
    expect(result.current.unlockedCount).toBe(10);
    expect(result.current.totalCount).toBe(20);
    expect(result.current.completionPercent).toBe(50);
    expect(result.current.stats).toHaveLength(3);
  });

  it('takes the two-week stat from the backend report, not Steam playtime_2weeks', () => {
    // The owned-games item this screen is navigated with carries no playtime_2weeks at all.
    const { result } = renderHook(() =>
      useGameViewData({ ...gameItem, playtime_2weeks: undefined }, 'player-1')
    );

    expect(result.current.stats[1]).toEqual({ value: '3h', label: '2 weeks' });
  });

  it('shows a placeholder while the report is still in flight', () => {
    (useGetPlaytimeReport as jest.Mock).mockReturnValueOnce({
      playtimeReport: null,
      isLoadingPlaytimeReport: true,
    });

    const { result } = renderHook(() => useGameViewData(gameItem, 'player-1'));

    expect(result.current.stats[1].value).toBe('—');
  });

  it('reads zero hours for a game the report never mentions', () => {
    const { result } = renderHook(() => useGameViewData({ ...gameItem, appid: '730' }, 'player-1'));

    expect(result.current.stats[1].value).toBe('0h');
  });

  it('calls all refetch methods when refetchAll is triggered', async () => {
    const { result } = renderHook(() => useGameViewData(gameItem, 'player-1'));

    await act(async () => {
      await result.current.refetchAll();
    });

    expect(mockRefetchGameStreak).toHaveBeenCalledTimes(1);
    expect(mockRefetchGlobalAchievements).toHaveBeenCalledTimes(1);
    expect(mockRefetchAchievements).toHaveBeenCalledTimes(1);
    expect(mockRefetchScreenshots).toHaveBeenCalledTimes(1);
    expect(mockRefetchCurrentPlayers).toHaveBeenCalledTimes(1);
    expect(mockRefetchPlaytimeReport).toHaveBeenCalledTimes(1);
    expect(mockRefetchGameStatus).toHaveBeenCalledTimes(1);
  });
});
