import { useCallback, useState } from 'react';
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
}

export const useFriendActions = ({
  onFriendListChanged,
  onSearchResultsChanged,
}: UseFriendActionsParams): FriendActions => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const runAction = useCallback(
    async (action: () => Promise<void>, successMessage: string, failureMessage: string) => {
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

  return {
    isActionLoading,
    actionFeedback,
    handleAddFriend,
    handleAcceptFriend,
    handleRefuseFriend,
  };
};
