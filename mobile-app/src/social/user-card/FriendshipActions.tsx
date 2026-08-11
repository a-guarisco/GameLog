import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { UserSearchResult } from '@gamelog/api-manager/dto';

interface AddFriendActionProps {
  userId: string;
  onAddFriend: (userId: string) => void;
  isDisabled?: boolean;
}

export const AddFriendAction: React.FC<AddFriendActionProps> = ({
  userId,
  onAddFriend,
  isDisabled,
}) => (
  <Button
    size="xs"
    variant="solid"
    action="primary"
    isDisabled={isDisabled}
    onPress={() => onAddFriend(userId)}
    testID={`add-friend-btn-${userId}`}
  >
    <ButtonText>Add Friend</ButtonText>
  </Button>
);

interface IncomingRequestActionsProps {
  userId: string;
  friendshipId: string;
  onAccept: (friendshipId: string) => void;
  onRefuse: (friendshipId: string) => void;
  isDisabled?: boolean;
}

export const IncomingRequestActions: React.FC<IncomingRequestActionsProps> = ({
  userId,
  friendshipId,
  onAccept,
  onRefuse,
  isDisabled,
}) => (
  <HStack space="sm" className="items-center">
    <Button
      size="xs"
      variant="solid"
      action="positive"
      isDisabled={isDisabled}
      onPress={() => onAccept(friendshipId)}
      testID={`accept-btn-${userId}`}
    >
      <ButtonText>Accept</ButtonText>
    </Button>
    <Button
      size="xs"
      variant="outline"
      action="negative"
      isDisabled={isDisabled}
      onPress={() => onRefuse(friendshipId)}
      testID={`refuse-btn-${userId}`}
    >
      <ButtonText>Refuse</ButtonText>
    </Button>
  </HStack>
);

interface RecommendActionProps {
  item: UserSearchResult;
  onSelectRecommendations: (item: UserSearchResult) => void;
  isDisabled?: boolean;
}

export const RecommendAction: React.FC<RecommendActionProps> = ({
  item,
  onSelectRecommendations,
  isDisabled,
}) => (
  <Button
    size="xs"
    variant="solid"
    action="primary"
    isDisabled={isDisabled}
    onPress={() => onSelectRecommendations(item)}
    testID={`recommend-btn-${item.user.id}`}
  >
    <ButtonText>Recommend</ButtonText>
  </Button>
);
