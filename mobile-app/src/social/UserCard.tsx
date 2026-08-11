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

  const renderBadgeOrActions = () => {
    if (status === 'accepted') {
      return (
        <HStack className="items-center space-x-2">
          <Box className="bg-emerald-600/30 px-3 py-1 rounded-full border border-emerald-500/40">
            <Text className="text-emerald-400 font-semibold text-xs uppercase">Friend</Text>
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
        <HStack className="items-center space-x-2">
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
        <Box className="bg-amber-600/30 px-3 py-1 rounded-full border border-amber-500/40">
          <Text className="text-amber-400 font-semibold text-xs uppercase">Request Sent</Text>
        </Box>
      );
    }

    if (status === 'blocked') {
      return (
        <Box className="bg-red-600/30 px-3 py-1 rounded-full border border-red-500/40">
          <Text className="text-red-400 font-semibold text-xs uppercase">Blocked</Text>
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
    <Box className="bg-background-200 p-4 rounded-xl mb-3 shadow-md border border-outline-100 flex-row items-center justify-between">
      <HStack className="items-center space-x-3 flex-1 mr-2">
        <Box className="w-10 h-10 rounded-full bg-primary-600 items-center justify-center border border-primary-400">
          <Text className="text-white font-bold text-lg uppercase">
            {user.username ? user.username.charAt(0) : 'U'}
          </Text>
        </Box>
        <VStack className="flex-1">
          <Text className="font-bold text-white text-base">{user.username}</Text>
          <Text className="text-xs text-typography-400">Steam ID: {user.steam_id}</Text>
        </VStack>
      </HStack>

      <Box className="items-end">{renderBadgeOrActions()}</Box>
    </Box>
  );
};
