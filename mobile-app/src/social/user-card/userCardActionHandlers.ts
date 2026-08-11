import { UserSearchResult } from '@gamelog/api-manager/dto';

export interface UserCardActionHandlers {
  onAddFriend?: (userId: string) => void;
  onAcceptFriend?: (friendshipId: string) => void;
  onRefuseFriend?: (friendshipId: string) => void;
  onSelectRecommendations?: (item: UserSearchResult) => void;
}
