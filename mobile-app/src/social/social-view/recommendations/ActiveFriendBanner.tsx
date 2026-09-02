import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { UserAvatar } from '../../user-card/UserAvatar';

interface ActiveFriendBannerProps {
  friendName: string;
  onChangeFriend: () => void;
}

export const ActiveFriendBanner: React.FC<ActiveFriendBannerProps> = ({
  friendName,
  onChangeFriend,
}) => {
  return (
    <Box className="px-4 mb-4">
      <Card
        variant="elevated"
        className="p-3 bg-background-50 border border-primary-500/30 rounded-lg"
      >
        <HStack space="md" className="items-center justify-between">
          <HStack space="md" className="items-center flex-1 pr-2">
            <UserAvatar username={friendName} isHighlighted={true} />
            <VStack className="flex-1">
              <Text size="xs" className="font-medium text-typography-400">
                Active Friend
              </Text>
              <Text
                size="sm"
                className="font-bold uppercase text-primary-700"
                numberOfLines={1}
              >
                {friendName}
              </Text>
            </VStack>
          </HStack>

          <Button
            size="xs"
            variant="outline"
            action="primary"
            onPress={onChangeFriend}
            testID="search-another-friend-btn"
          >
            <Ionicons
              name="search-outline"
              size={14}
              color={toHex(brand.primary['500'])}
              style={{ marginRight: 4 }}
            />
            <ButtonText>Change Friend</ButtonText>
          </Button>
        </HStack>
      </Card>
    </Box>
  );
};
