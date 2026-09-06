import { UserSearchResult } from '@gamelog/api-manager/dto';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

export type FriendshipStatus = NonNullable<UserSearchResult['friendship']>['friendship_status'];

export type BadgeTone = 'success' | 'warning' | 'error';

export interface FriendshipBadgeConfig {
  label: string;
  tone: BadgeTone;
}

export interface FriendshipStatusStyle {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  hex: string;
}

export const getFriendshipStatusStyle = (status?: string | null): FriendshipStatusStyle => {
  switch (status) {
    case 'accepted':
      return {
        label: 'Friend',
        bgClass: 'bg-primary-500/15 dark:bg-primary-500/25',
        borderClass: 'border-primary-500/60 dark:border-primary-500/40',
        textClass: 'text-primary-500 dark:text-primary-400',
        hex: HEX_COLORS.social.action.accept.hex,
      };
    case 'pending_incoming':
      return {
        label: 'Pending',
        bgClass: 'bg-warning-500/15 dark:bg-warning-500/25',
        borderClass: 'border-warning-500/60 dark:border-warning-500/40',
        textClass: 'text-warning-500 dark:text-warning-400',
        hex: HEX_COLORS.feedback.warning.hex,
      };
    case 'pending_outgoing':
      return {
        label: 'Requested',
        bgClass: 'bg-warning-500/15 dark:bg-warning-500/25',
        borderClass: 'border-warning-500/60 dark:border-warning-500/40',
        textClass: 'text-warning-500 dark:text-warning-400',
        hex: HEX_COLORS.feedback.warning.hex,
      };
    case 'blocked':
      return {
        label: 'Blocked',
        bgClass: 'bg-error-500/15 dark:bg-error-500/25',
        borderClass: 'border-error-500/60 dark:border-error-500/40',
        textClass: 'text-error-500 dark:text-error-400',
        hex: HEX_COLORS.feedback.error.hex,
      };
    default:
      return {
        label: 'Player',
        bgClass: 'bg-background-100 dark:bg-background-200/40',
        borderClass: 'border-outline-100 dark:border-outline-200',
        textClass: 'text-typography-300 dark:text-typography-400',
        hex: HEX_COLORS.muted.icon.hex,
      };
  }
};

export const FRIENDSHIP_BADGES: Partial<Record<FriendshipStatus, FriendshipBadgeConfig>> = {
  accepted: { label: 'Friend', tone: 'success' },
  pending_outgoing: { label: 'Request Sent', tone: 'warning' },
  blocked: { label: 'Blocked', tone: 'error' },
};
