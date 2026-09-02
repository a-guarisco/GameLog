import { Pressable } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { Text } from '@gamelog/common/gluestack/text';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

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
  <HStack space="xs" className="items-center">
    <Pressable
      onPress={() => onAccept(friendshipId)}
      disabled={isDisabled}
      testID={`accept-btn-${userId}`}
      hitSlop={6}
      className="flex-row items-center gap-1 rounded-lg border border-primary-500/60 bg-primary-500/15 px-2.5 py-1.5 active:opacity-70"
    >
      <Ionicons name="checkmark" size={13} color={toHex(brand.primary['400'])} />
      <Text size="xs" className="font-semibold text-primary-400">
        Accept
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onRefuse(friendshipId)}
      disabled={isDisabled}
      testID={`refuse-btn-${userId}`}
      hitSlop={6}
      className="flex-row items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 active:opacity-70"
    >
      <Ionicons name="close" size={13} color={toHex(brand.primary['200'])} />
      <Text size="xs" className="font-semibold text-typography-300">
        Refuse
      </Text>
    </Pressable>
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
