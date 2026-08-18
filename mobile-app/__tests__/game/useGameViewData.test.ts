import { renderHook } from '@testing-library/react-native';
import { useGameViewData, toGameScreenshots } from '@gamelog/game/useGameViewData';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameStreak: jest.fn(() => ({ gameStreak: { streak: 5 }, isLoadingGameStreak: false })),
  useGetGlobalAchievement: jest.fn(() => ({ globalAchievements: [] })),
  useGetGameScreenshots: jest.fn(() => ({
    screenshots: [],
    totalScreenshots: 0,
    loadMoreScreenshots: jest.fn(),
    isLoadingScreenshots: false,
    isLoadingMoreScreenshots: false,
  })),
  useGetNumberOfCurrentPlayers: jest.fn(() => ({ currentPlayers: { response: { player_count: 1234 } } })),
}));

jest.mock('@gamelog/game/useAchievementsData', () => jest.fn(() => ({
  unlockedCount: 10,
  totalCount: 20,
  completionPercent: 50,
})));

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
});
