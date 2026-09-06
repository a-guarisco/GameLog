import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOtherUserProfile } from '@gamelog/social/other-user-profile/useOtherUserProfile';
import ApiManager from '@gamelog/api-manager/apiManager';
import { DeviceEventEmitter } from 'react-native';

jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamId: () => 'my-steam-id',
}));

describe('useOtherUserProfile', () => {
  const mockUser = {
    id: 'user-1',
    firebase_uid: 'fb-1',
    username: 'OtherUser',
    steam_id: '76561198000000002',
    has_steam_api_key: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiManager.getPlayersInfo as jest.Mock).mockResolvedValue({
      response: {
        players: [{ steamid: '76561198000000002', personaname: 'PlayerTwo' }],
      },
    });
    (ApiManager.getOwnedGames as jest.Mock).mockResolvedValue({
      response: {
        game_count: 2,
        games: [
          { appid: 10, name: 'CS', playtime_forever: 120 },
          { appid: 20, name: 'TF2', playtime_forever: 60 },
        ],
      },
    });
  });

  it('fetches player info, target games, and current user games', async () => {
    const { result } = renderHook(() => useOtherUserProfile({ user: mockUser }));

    await waitFor(() => {
      expect(result.current.player?.personaname).toBe('PlayerTwo');
      expect(result.current.totalGamesCount).toBe(2);
      expect(result.current.totalPlaytimeHours).toBe(3);
    });
  });

  it('handles user without steam_id gracefully', async () => {
    const noSteamUser = {
      id: 'user-2',
      firebase_uid: 'fb-2',
      username: 'NoSteam',
      steam_id: '',
      has_steam_api_key: false,
    };
    const { result } = renderHook(() => useOtherUserProfile({ user: noSteamUser }));

    expect(result.current.totalGamesCount).toBe(0);
    expect(result.current.totalPlaytimeHours).toBe(0);
  });

  it('handles handleAddFriend', async () => {
    (ApiManager.addFriend as jest.Mock).mockResolvedValueOnce({
      friendship_id: 'new-f-id',
    });
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');

    const { result } = renderHook(() => useOtherUserProfile({ user: mockUser }));

    await act(async () => {
      await result.current.handleAddFriend();
    });

    expect(result.current.friendship?.friendship_id).toBe('new-f-id');
    expect(result.current.friendship?.friendship_status).toBe('pending_outgoing');
    expect(emitSpy).toHaveBeenCalledWith('friendListChanged');
  });

  it('handles handleAcceptFriend', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Accepted',
    });
    const { result } = renderHook(() =>
      useOtherUserProfile({
        user: mockUser,
        initialFriendship: { friendship_id: 'f-1', friendship_status: 'pending_incoming' },
      })
    );

    await act(async () => {
      await result.current.handleAcceptFriend('f-1');
    });

    expect(result.current.friendship?.friendship_status).toBe('accepted');
  });

  it('handles handleRefuseFriend', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Rejected',
    });
    const { result } = renderHook(() =>
      useOtherUserProfile({
        user: mockUser,
        initialFriendship: { friendship_id: 'f-1', friendship_status: 'pending_incoming' },
      })
    );

    await act(async () => {
      await result.current.handleRefuseFriend('f-1');
    });

    expect(result.current.friendship).toBeNull();
  });

  it('handles handleBlockFriend', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Blocked',
    });
    const { result } = renderHook(() => useOtherUserProfile({ user: mockUser }));

    await act(async () => {
      await result.current.handleBlockFriend('f-1');
    });

    expect(result.current.friendship?.friendship_status).toBe('blocked');
  });

  it('handles handleRemoveFriend', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Removed',
    });
    const { result } = renderHook(() =>
      useOtherUserProfile({
        user: mockUser,
        initialFriendship: { friendship_id: 'f-1', friendship_status: 'accepted' },
      })
    );

    await act(async () => {
      await result.current.handleRemoveFriend('f-1');
    });

    expect(result.current.friendship).toBeNull();
  });

  it('handles handleRemovePending', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Cancelled',
    });
    const { result } = renderHook(() =>
      useOtherUserProfile({
        user: mockUser,
        initialFriendship: { friendship_id: 'f-1', friendship_status: 'pending_outgoing' },
      })
    );

    await act(async () => {
      await result.current.handleRemovePending('f-1');
    });

    expect(result.current.friendship).toBeNull();
  });

  it('handles handleUnblockFriend', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({
      message: 'Unblocked',
    });
    const { result } = renderHook(() =>
      useOtherUserProfile({
        user: mockUser,
        initialFriendship: { friendship_id: 'f-1', friendship_status: 'blocked' },
      })
    );

    await act(async () => {
      await result.current.handleUnblockFriend('f-1');
    });

    expect(result.current.friendship).toBeNull();
  });

  it('refetches all data when refetchAll is called', async () => {
    const { result } = renderHook(() => useOtherUserProfile({ user: mockUser }));

    await waitFor(() => {
      expect(result.current.player?.personaname).toBe('PlayerTwo');
    });

    const initialPlayerCalls = (ApiManager.getPlayersInfo as jest.Mock).mock.calls.length;
    const initialGamesCalls = (ApiManager.getOwnedGames as jest.Mock).mock.calls.length;

    await act(async () => {
      await result.current.refetchAll();
    });

    expect((ApiManager.getPlayersInfo as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialPlayerCalls
    );
    expect((ApiManager.getOwnedGames as jest.Mock).mock.calls.length).toBeGreaterThan(
      initialGamesCalls
    );
  });
});
