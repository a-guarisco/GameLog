import { useCallback, useEffect, useRef, useState } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';

interface UseFriendActionsParams {
  onFriendListChanged: () => void;
  onSearchResultsChanged: () => void;
}

export interface FriendActions {
  isActionLoading: boolean;
  actionFeedback: string | null;
  handleAddFriend: (userId: string) => Promise<void>;
  handleAcceptFriend: (friendshipId: string) => Promise<void>;
  handleRefuseFriend: (friendshipId: string) => Promise<void>;
  handleBlockFriend: (friendshipId: string) => Promise<void>;
  handleRemoveFriend: (friendshipId: string) => Promise<void>;
  handleUnblockFriend: (friendshipId: string) => Promise<void>;
}

export const useFriendActions = ({
  onFriendListChanged,
  onSearchResultsChanged,
}: UseFriendActionsParams): FriendActions => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (actionFeedback) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setActionFeedback(null);
      }, 3000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [actionFeedback]);

  const runAction = useCallback(
    async (action: () => Promise<void>, successMessage: string, failureMessage: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsActionLoading(true);
      setActionFeedback(null);
      try {
        await action();
        setActionFeedback(successMessage);
        onFriendListChanged();
        onSearchResultsChanged();
      } catch (err: any) {
        setActionFeedback(err.message || failureMessage);
      } finally {
        setIsActionLoading(false);
      }
    },
    [onFriendListChanged, onSearchResultsChanged]
  );

  const handleAddFriend = useCallback(
    (userId: string) =>
      runAction(
        () => ApiManager.addFriend(userId),
        'Friend request sent successfully!',
        'Failed to send friend request'
      ),
    [runAction]
  );

  const handleAcceptFriend = useCallback(
    (friendshipId: string) =>
      runAction(
        () => ApiManager.respondToFriend(friendshipId, 'ACCEPTED'),
        'Friend request accepted!',
        'Failed to accept friend request'
      ),
    [runAction]
  );

  const handleRefuseFriend = useCallback(
    (friendshipId: string) =>
      runAction(
        () => ApiManager.respondToFriend(friendshipId, 'REJECTED'),
        'Friend request refused.',
        'Failed to refuse friend request'
      ),
    [runAction]
  );

  const handleBlockFriend = useCallback(
    (friendshipId: string) =>
      runAction(
        () => ApiManager.respondToFriend(friendshipId, 'BLOCKED'),
        'User blocked.',
        'Failed to block user'
      ),
    [runAction]
  );

  const handleRemoveFriend = useCallback(
    (friendshipId: string) =>
      runAction(
        () => ApiManager.removeFriend(friendshipId),
        'Friend removed.',
        'Failed to remove friend'
      ),
    [runAction]
  );

  const handleUnblockFriend = useCallback(
    (friendshipId: string) =>
      runAction(
        () => ApiManager.removeFriend(friendshipId),
        'User unblocked.',
        'Failed to unblock user'
      ),
    [runAction]
  );

  return {
    isActionLoading,
    actionFeedback,
    handleAddFriend,
    handleAcceptFriend,
    handleRefuseFriend,
    handleBlockFriend,
    handleRemoveFriend,
    handleUnblockFriend,
  };
};
