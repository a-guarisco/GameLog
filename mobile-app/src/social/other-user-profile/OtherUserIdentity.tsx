import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Avatar, AvatarFallbackText, AvatarImage } from '@gamelog/common/gluestack/avatar';
import { Box } from '@gamelog/common/gluestack/box';
import Chip from '@gamelog/common/Chip';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';
import { selectMemberSinceLabel } from '@gamelog/profile/selectProfile';
import { UserCardActions } from '../user-card/UserCardActions';
import type { UserSearchResult, UserRead, FriendshipInfo, Player } from '@gamelog/api-manager/dto';
import type { UserCardActionHandlers } from '../user-card/userCardActionHandlers';

interface OtherUserIdentityProps extends UserCardActionHandlers {
  user: UserRead;
  player?: Player;
  friendship?: FriendshipInfo | null;
  isActionLoading?: boolean;
  isLandscape?: boolean;
}

export const OtherUserIdentity: React.FC<OtherUserIdentityProps> = ({
  user,
  player,
  friendship,
  isActionLoading,
  isLandscape = false,
  ...handlers
}) => {
  const status = friendship?.friendship_status;
  const isFriend = status === 'accepted';
  const isPending = status === 'pending_incoming';
  const isPendingOutgoing = status === 'pending_outgoing';
  const isBlocked = status === 'blocked';

  const statusLabel = isFriend
    ? 'Friend'
    : isPending
      ? 'Pending'
      : isPendingOutgoing
        ? 'Requested'
        : isBlocked
          ? 'Blocked'
          : 'Player';

  const badgeBgClass = isFriend
    ? 'bg-primary-500 border-background-0'
    : isPending || isPendingOutgoing || isBlocked
      ? 'bg-background-200 border-background-0'
      : 'bg-background-200 border-background-0';

  const badgeTextClass = isFriend
    ? 'text-white'
    : 'text-typography-100';

  const displayName = player?.personaname || user.username;
  const memberSinceLabel = selectMemberSinceLabel(player?.timecreated);

  const searchResultItem: UserSearchResult = {
    user,
    friendship: friendship ?? {},
  };

  const content = (
    <>
      <Avatar size="xl" className="border-[4px] border-background-0 bg-background-300 z-10">
        <AvatarFallbackText>{displayName}</AvatarFallbackText>
        {!!player?.avatarfull && (
          <AvatarImage
            source={{ uri: player.avatarfull }}
            alt={`${displayName} avatar`}
            resizeMode="cover"
          />
        )}
      </Avatar>

      <Box className="bg-background-0 px-4 py-1 rounded-full z-10">
        <PageTitle size="xl" className="text-center" numberOfLines={1}>
          {displayName}
        </PageTitle>
      </Box>

      <HStack space="xs" className="flex-wrap items-center justify-center z-10">
        {!!memberSinceLabel && (
          <Chip
              className="bg-background-50 border border-outline-50 shadow-sm"
            testID="other-user-member-since-chip"
          >
            <Text size="xs" className="font-bold text-typography-100">
              {memberSinceLabel}
            </Text>
          </Chip>
        )}

          <Chip
            className={`${badgeBgClass} border-[4px]`}
            testID="other-user-status-chip"
          >
            <Text size="xs" className={`font-bold ${badgeTextClass}`}>
              {statusLabel}
            </Text>
          </Chip>

        <UserCardActions
          item={searchResultItem}
          handlers={handlers}
          isActionLoading={isActionLoading}
        />
      </HStack>
    </>
  );

  return (
    <Box className="w-full items-center z-10" style={{ height: 0, overflow: 'visible' }}>
      <VStack space="xs" className="absolute w-full items-center" style={{ top: -136 }}>
        {content}
      </VStack>
    </Box>
  );
};

export default OtherUserIdentity;
