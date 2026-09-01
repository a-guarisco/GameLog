import { useState, useCallback, useMemo } from 'react';
import { DeviceEventEmitter } from 'react-native';
import ApiManager from '@gamelog/api-manager/apiManager';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';
import type {
  UserRead,
  FriendshipInfo,
  OwnedGames,
  PlayersInfo,
  GameItem,
} from '@gamelog/api-manager/dto';
import { selectMostPlayedGame } from '@gamelog/profile/selectProfile';

export interface UseOtherUserProfileProps {
  user: UserRead;
  initialFriendship?: FriendshipInfo | null;
}

export const useOtherUserProfile = ({ user, initialFriendship }: UseOtherUserProfileProps) => {
  const currentSteamId = getSteamId();
  const [friendship, setFriendship] = useState<FriendshipInfo | null | undefined>(
    initialFriendship
  );
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch target user's Steam player summary
  const fetchTargetPlayerInfo = useCallback(() => {
    if (!user.steam_id) return Promise.resolve(null as unknown as PlayersInfo);
    return ApiManager.getPlayersInfo([user.steam_id]);
  }, [user.steam_id]);

  const {
    data: playersInfo,
    isLoading: isLoadingPlayer,
    error: errorPlayer,
  } = useAsyncFetch<PlayersInfo>(fetchTargetPlayerInfo);

  // Fetch target user's Steam owned games
  const fetchTargetOwnedGames = useCallback(() => {
    if (!user.steam_id) return Promise.resolve(null as unknown as OwnedGames);
    return ApiManager.getOwnedGames(user.steam_id, true, true);
  }, [user.steam_id]);

  const {
    data: targetOwnedGames,
    isLoading: isLoadingTargetGames,
    error: errorTargetGames,
    refetch: refetchTargetGames,
  } = useAsyncFetch<OwnedGames>(fetchTargetOwnedGames);

  // Fetch current user's Steam owned games (for radar & top games comparison)
  const fetchCurrentUserGames = useCallback(() => {
    if (!currentSteamId) return Promise.resolve(null as unknown as OwnedGames);
    return ApiManager.getOwnedGames(currentSteamId, true, true);
  }, [currentSteamId]);

  const {
    data: currentUserOwnedGames,
    isLoading: isLoadingCurrentUserGames,
  } = useAsyncFetch<OwnedGames>(fetchCurrentUserGames);

  const player = playersInfo?.response?.players?.[0];
  const mostPlayedGame = useMemo<GameItem | null>(
    () => selectMostPlayedGame(targetOwnedGames),
    [targetOwnedGames]
  );

  const totalGamesCount = useMemo(() => {
    return targetOwnedGames?.response?.game_count ?? targetOwnedGames?.response?.games?.length ?? 0;
  }, [targetOwnedGames]);

  const totalPlaytimeHours = useMemo(() => {
    const games = targetOwnedGames?.response?.games ?? [];
    const totalMinutes = games.reduce((sum, g) => sum + (g.playtime_forever ?? 0), 0);
    return Math.floor(totalMinutes / 60);
  }, [targetOwnedGames]);

  // Friendship action handlers
  const handleAddFriend = useCallback(async () => {
    setIsActionLoading(true);
    try {
      const res = await ApiManager.addFriend(user.id);
      setFriendship({
        friendship_id: res.friendship_id,
        friendship_status: 'pending_outgoing',
        friendship_requester_id: currentSteamId,
        since: new Date().toISOString(),
      });
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, [user.id, currentSteamId]);

  const handleAcceptFriend = useCallback(async (friendshipId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('ACCEPT', friendshipId);
      setFriendship((prev) => ({
        ...prev,
        friendship_status: 'accepted',
        since: new Date().toISOString(),
      }));
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleRefuseFriend = useCallback(async (friendshipId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('REJECT', friendshipId);
      setFriendship(null);
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleBlockFriend = useCallback(async (friendshipIdOrUserId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('BLOCK', friendshipIdOrUserId, user.id);
      setFriendship((prev) => ({
        ...prev,
        friendship_status: 'blocked',
        since: new Date().toISOString(),
      }));
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, [user.id]);

  const handleRemoveFriend = useCallback(async (friendshipId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('REMOVE', friendshipId);
      setFriendship(null);
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleRemovePending = useCallback(async (friendshipId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('CANCEL', friendshipId);
      setFriendship(null);
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const handleUnblockFriend = useCallback(async (friendshipId: string) => {
    setIsActionLoading(true);
    try {
      await ApiManager.manageFriendship('UNBLOCK', friendshipId);
      setFriendship(null);
      DeviceEventEmitter.emit('friendListChanged');
    } catch {
      // Keep state
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  return {
    player,
    targetOwnedGames,
    currentUserOwnedGames,
    mostPlayedGame,
    totalGamesCount,
    totalPlaytimeHours,
    friendship,
    isLoading: isLoadingPlayer || isLoadingTargetGames,
    isLoadingCurrentUserGames,
    error: errorPlayer || errorTargetGames,
    isActionLoading,
    refetchTargetGames,
    handleAddFriend,
    handleAcceptFriend,
    handleRefuseFriend,
    handleBlockFriend,
    handleRemoveFriend,
    handleRemovePending,
    handleUnblockFriend,
  };
};

export default useOtherUserProfile;
