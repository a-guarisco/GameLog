import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { UserSearchResult } from '@gamelog/api-manager/dto';

interface UserCardProps {
  item: UserSearchResult;
  onAddFriend?: (userId: string) => void;
  onAcceptFriend?: (friendshipId: string) => void;
  onRefuseFriend?: (friendshipId: string) => void;
  onSelectRecommendations?: (user: UserSearchResult) => void;
  isActionLoading?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  item,
  onAddFriend,
  onAcceptFriend,
  onRefuseFriend,
  onSelectRecommendations,
  isActionLoading,
}) => {
  const { user, friendship } = item;
  const status = friendship?.friendship_status;
  const friendshipId = friendship?.friendship_id;
  const isFriend = status === 'accepted';

  const renderBadgeOrActions = () => {
    if (status === 'accepted') {
      return (
        <HStack space="sm" className="items-center">
          <Box className="bg-success-500/15 px-2 py-0.5 rounded-md">
            <Text size="xs" className="font-bold uppercase text-success-700">
              Friend
            </Text>
          </Box>
          {onSelectRecommendations && (
            <Button
              size="xs"
              variant="solid"
              action="primary"
              isDisabled={isActionLoading}
              onPress={() => onSelectRecommendations(item)}
              testID={`recommend-btn-${user.id}`}
            >
              <ButtonText>Recommend</ButtonText>
            </Button>
          )}
        </HStack>
      );
    }

    if (status === 'pending_incoming' && friendshipId) {
      return (
        <HStack space="sm" className="items-center">
          {onAcceptFriend && (
            <Button
              size="xs"
              variant="solid"
              action="positive"
              isDisabled={isActionLoading}
              onPress={() => onAcceptFriend(friendshipId)}
              testID={`accept-btn-${user.id}`}
            >
              <ButtonText>Accept</ButtonText>
            </Button>
          )}
          {onRefuseFriend && (
            <Button
              size="xs"
              variant="outline"
              action="negative"
              isDisabled={isActionLoading}
              onPress={() => onRefuseFriend(friendshipId)}
              testID={`refuse-btn-${user.id}`}
            >
              <ButtonText>Refuse</ButtonText>
            </Button>
          )}
        </HStack>
      );
    }

    if (status === 'pending_outgoing') {
      return (
        <Box className="bg-warning-500/15 px-2 py-0.5 rounded-md">
          <Text size="xs" className="font-bold uppercase text-warning-700">
            Request Sent
          </Text>
        </Box>
      );
    }

    if (status === 'blocked') {
      return (
        <Box className="bg-error-500/15 px-2 py-0.5 rounded-md">
          <Text size="xs" className="font-bold uppercase text-error-700">
            Blocked
          </Text>
        </Box>
      );
    }

    // Default: no friendship -> Add Friend button
    return (
      onAddFriend && (
        <Button
          size="xs"
          variant="solid"
          action="primary"
          isDisabled={isActionLoading}
          onPress={() => onAddFriend(user.id)}
          testID={`add-friend-btn-${user.id}`}
        >
          <ButtonText>Add Friend</ButtonText>
        </Button>
      )
    );
  };

  return (
    <Box className="relative overflow-hidden rounded-lg mb-3 bg-background-200 shadow-md">
      <HStack space="md" className="relative z-10 px-3 py-3 items-start">
        <Box
          className={`w-10 h-10 rounded-md items-center justify-center shrink-0 ${
            isFriend ? 'bg-success-100' : 'bg-background-300'
          }`}
        >
          <Text className="text-white font-bold text-lg uppercase">
            {user.username ? user.username.charAt(0) : 'U'}
          </Text>
        </Box>

        <VStack className="flex-1">
          <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
            {user.username}
          </Text>
          <Text size="xs" className="font-medium text-typography-400 mt-0.5">
            Steam ID: {user.steam_id}
          </Text>

          <Box className="mt-2 items-start">{renderBadgeOrActions()}</Box>
        </VStack>
      </HStack>
    </Box>
  );
};
