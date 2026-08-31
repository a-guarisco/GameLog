import { renderHook, waitFor } from '@testing-library/react-native';
import { useCommunityTopGames } from '@gamelog/common/charts/community-top-games-histogram/useCommunityTopGames';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager', () => ({
  __esModule: true,
  default: {
    getCommunityWeeklyTopGames: jest.fn(),
    getCommunityMonthlyTopGames: jest.fn(),
  },
}));

describe('useCommunityTopGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches weekly top games with correct parameters', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValueOnce([
      { id: '1245620', user_playtime: 10.5, community_playtime: 2.0 },
    ]);

    const testDate = new Date('2026-08-30T12:00:00Z');
    const { result } = renderHook(() =>
      useCommunityTopGames({
        scope: 'global',
        periodRange: 'week',
        offset: 0,
        currentDate: testDate,
      })
    );

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyTopGames).toHaveBeenCalledWith(
        'global',
        '2026-08-24',
        '2026-08-30',
        'community'
      );
      expect(result.current.data).toEqual([
        { id: '1245620', user_playtime: 10.5, community_playtime: 2.0 },
      ]);
    });
  });

  it('fetches monthly top games with correct parameters', async () => {
    (ApiManager.getCommunityMonthlyTopGames as jest.Mock).mockResolvedValueOnce([
      { id: '730', user_playtime: 20.0, community_playtime: 15.0 },
    ]);

    const testDate = new Date('2026-08-30T12:00:00Z');
    const { result } = renderHook(() =>
      useCommunityTopGames({
        scope: 'region',
        periodRange: 'month',
        offset: 0,
        currentDate: testDate,
      })
    );

    await waitFor(() => {
      expect(ApiManager.getCommunityMonthlyTopGames).toHaveBeenCalledWith(
        'region',
        '2026-07-01',
        '2026-12-31',
        'community'
      );
      expect(result.current.data).toEqual([
        { id: '730', user_playtime: 20.0, community_playtime: 15.0 },
      ]);
    });
  });

  it('fetches top games with user reference parameter', async () => {
    (ApiManager.getCommunityWeeklyTopGames as jest.Mock).mockResolvedValueOnce([
      { id: '1245620', user_playtime: 10.5, community_playtime: 2.0 },
    ]);

    const testDate = new Date('2026-08-30T12:00:00Z');
    const { result } = renderHook(() =>
      useCommunityTopGames({
        scope: 'global',
        periodRange: 'week',
        reference: 'user',
        offset: 0,
        currentDate: testDate,
      })
    );

    await waitFor(() => {
      expect(ApiManager.getCommunityWeeklyTopGames).toHaveBeenCalledWith(
        'global',
        '2026-08-24',
        '2026-08-30',
        'user'
      );
      expect(result.current.data).toEqual([
        { id: '1245620', user_playtime: 10.5, community_playtime: 2.0 },
      ]);
    });
  });
});
