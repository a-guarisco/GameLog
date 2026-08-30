import { renderHook, waitFor } from '@testing-library/react-native';
import { useCommunityGenre } from '@gamelog/common/charts/community-genre-radar/useCommunityGenre';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager');

describe('useCommunityGenre', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches community genres for global scope successfully', async () => {
    const mockData = [
      { id: '1', description: 'Action', percentage: 42.94 },
      { id: '37', description: 'Free To Play', percentage: 24.65 },
    ];
    (ApiManager.getCommunityGenre as jest.Mock).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCommunityGenre('global'));

    expect(result.current.isLoadingCommunity).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingCommunity).toBe(false);
    });

    expect(ApiManager.getCommunityGenre).toHaveBeenCalledWith('global');
    expect(result.current.communityGenres).toEqual(mockData);
    expect(result.current.errorCommunity).toBe(false);
  });

  it('handles error response from backend', async () => {
    (ApiManager.getCommunityGenre as jest.Mock).mockRejectedValueOnce(
      new Error('User region is not set')
    );

    const { result } = renderHook(() => useCommunityGenre('region'));

    expect(result.current.isLoadingCommunity).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingCommunity).toBe(false);
    });

    expect(result.current.communityGenres).toEqual([]);
    expect(result.current.errorCommunity).toBe(true);
    expect(result.current.errorMessageCommunity).toBe('User region is not set');
  });

  it('refetches when scope changes', async () => {
    const mockGlobal = [{ id: '1', description: 'Action', percentage: 40 }];
    const mockFriends = [{ id: '2', description: 'Strategy', percentage: 60 }];

    (ApiManager.getCommunityGenre as jest.Mock)
      .mockResolvedValueOnce(mockGlobal)
      .mockResolvedValueOnce(mockFriends);

    const { result, rerender } = renderHook(
      ({ scope }) => useCommunityGenre(scope as any),
      { initialProps: { scope: 'global' } }
    );

    await waitFor(() => {
      expect(result.current.communityGenres).toEqual(mockGlobal);
    });

    rerender({ scope: 'friends' });

    await waitFor(() => {
      expect(result.current.communityGenres).toEqual(mockFriends);
    });

    expect(ApiManager.getCommunityGenre).toHaveBeenCalledWith('friends');
  });
});
