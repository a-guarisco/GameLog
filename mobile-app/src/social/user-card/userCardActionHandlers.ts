import { UserSearchResult } from '@gamelog/api-manager/dto';

export interface UserCardActionHandlers {
  currentUserId?: string;
  onAddFriend?: (userId: string) => void;
  onAcceptFriend?: (friendshipId: string) => void;
  onRefuseFriend?: (friendshipId: string) => void;
  onBlockFriend?: (friendshipId: string) => void;
  onRemoveFriend?: (friendshipId: string) => void;
  onRemovePending?: (friendshipId: string) => void;
  onUnblockFriend?: (friendshipId: string) => void;
  onSelectRecommendations?: (item: UserSearchResult) => void;
  onSelectUser?: (item: UserSearchResult) => void;
}
