import { UserSearchResult } from '@gamelog/api-manager/dto';

export type FriendshipStatus = NonNullable<UserSearchResult['friendship']>['friendship_status'];

export type BadgeTone = 'success' | 'warning' | 'error';

export interface FriendshipBadgeConfig {
  label: string;
  tone: BadgeTone;
}

export const FRIENDSHIP_BADGES: Partial<Record<FriendshipStatus, FriendshipBadgeConfig>> = {
  accepted: { label: 'Friend', tone: 'success' },
  pending_outgoing: { label: 'Request Sent', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'error' },
};
