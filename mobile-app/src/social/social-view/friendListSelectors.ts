import { UserSearchResult } from '@gamelog/api-manager/dto';

export const selectPendingRequests = (friendList: UserSearchResult[]): UserSearchResult[] =>
  friendList.filter((item) => item.friendship?.friendship_status === 'pending_incoming');

export const selectAcceptedFriends = (friendList: UserSearchResult[]): UserSearchResult[] =>
  friendList.filter((item) => item.friendship?.friendship_status === 'accepted');
