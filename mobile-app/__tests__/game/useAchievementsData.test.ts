import { renderHook } from '@testing-library/react-native';
import useAchievementsData from '@gamelog/game/useAchievementsData';
import { useGetPlayerAchievementsPerApp } from '@gamelog/api-manager/useApi';
import type { GlobalAchievement, PlayerAchievement } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetPlayerAchievementsPerApp: jest.fn(),
}));

describe('useAchievementsData', () => {
  const mockUseGetPlayerAchievementsPerApp = useGetPlayerAchievementsPerApp as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults completionPercent to 100 when totalCount is 0 (no achievements)', () => {
    mockUseGetPlayerAchievementsPerApp.mockReturnValue({
      personalAchievements: null,
      isLoadingPlayerAchievement: false,
      errorPlayerAchievement: null,
    });

    const { result } = renderHook(() => useAchievementsData('413150', 'player-1', null));

    expect(result.current.mergedAchievements).toEqual([]);
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.completionPercent).toBe(100);
    expect(result.current.gameName).toBe('Unknown Game');
  });

  it('calculates unlockedCount, totalCount, and rounded completionPercent correctly with achievements', () => {
    const globalAchievements: GlobalAchievement = {
      achievementpercentages: {
        achievements: [
          { name: 'ACH_1', percent: 80, displayName: 'First' },
          { name: 'ACH_2', percent: 50, displayName: 'Second' },
          { name: 'ACH_3', percent: 20, displayName: 'Third' },
        ],
      },
    };

    const personalAchievements: PlayerAchievement = {
      playerstats: {
        steamID: 'player-1',
        gameName: 'Stardew Valley',
        achievements: [
          { apiname: 'ACH_1', achieved: 1, unlocktime: 1600000000 },
          { apiname: 'ACH_2', achieved: 1, unlocktime: 1600000050 },
          { apiname: 'ACH_3', achieved: 0, unlocktime: 0 },
        ],
        success: true,
      },
    };

    mockUseGetPlayerAchievementsPerApp.mockReturnValue({
      personalAchievements,
      isLoadingPlayerAchievement: false,
      errorPlayerAchievement: null,
    });

    const { result } = renderHook(() =>
      useAchievementsData('413150', 'player-1', globalAchievements)
    );

    expect(result.current.totalCount).toBe(3);
    expect(result.current.unlockedCount).toBe(2);
    // 2 / 3 * 100 = 66.666... => Math.round is 67
    expect(result.current.completionPercent).toBe(67);
    expect(result.current.gameName).toBe('Stardew Valley');
    expect(result.current.mergedAchievements).toHaveLength(3);
  });

  it('passes gameID and playerID to useGetPlayerAchievementsPerApp', () => {
    mockUseGetPlayerAchievementsPerApp.mockReturnValue({
      personalAchievements: null,
      isLoadingPlayerAchievement: false,
      errorPlayerAchievement: null,
    });

    renderHook(() => useAchievementsData('730', 'steam-user-123', undefined));

    expect(mockUseGetPlayerAchievementsPerApp).toHaveBeenCalledWith('730', 'steam-user-123');
  });

  it('forwards loading and error states from useGetPlayerAchievementsPerApp', () => {
    const mockError = new Error('Failed to fetch achievements');
    mockUseGetPlayerAchievementsPerApp.mockReturnValue({
      personalAchievements: null,
      isLoadingPlayerAchievement: true,
      errorPlayerAchievement: mockError,
    });

    const { result } = renderHook(() => useAchievementsData('413150', 'player-1', null));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(mockError);
  });
});
