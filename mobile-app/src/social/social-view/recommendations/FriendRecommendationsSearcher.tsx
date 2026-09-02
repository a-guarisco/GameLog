import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import SectionCard from '@gamelog/common/SectionCard';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { UserAvatar } from '../../user-card/UserAvatar';

interface FriendRecommendationsSearcherProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredFriends: UserSearchResult[];
  totalFriendsCount: number;
  isLoading: boolean;
  error: any;
  errorMessage?: string | null;
  onSelectFriend: (friend: UserSearchResult) => void;
}

export const FriendRecommendationsSearcher: React.FC<FriendRecommendationsSearcherProps> = ({
  searchQuery,
  onSearchQueryChange,
  filteredFriends,
  totalFriendsCount,
  isLoading,
  error,
  errorMessage,
  onSelectFriend,
}) => {
  if (isLoading) {
    return (
      <Box className="px-4">
        <LoadingBox message="Loading friends..." className="py-10" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="px-4">
        <ErrorBox
          errorMessage={errorMessage || 'Failed to load friends list.'}
          className="py-8"
        />
      </Box>
    );
  }

  if (totalFriendsCount === 0) {
    return (
      <Box className="px-4">
        <InfoBox
          message="You don't have any friends added yet. Add friends from the Social tab to compare recommendations!"
          className="py-8"
        />
      </Box>
    );
  }

  return (
    <VStack space="lg" className="px-4">
      <Box>
        <GLTextInput
          placeholder="Search friends by username..."
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          testID="friend-search-input"
        />
      </Box>

      <SectionCard
        label={
          searchQuery
            ? `Matching Friends (${filteredFriends.length})`
            : `Select a Friend (${totalFriendsCount})`
        }
      >
        {filteredFriends.length === 0 ? (
          <Box className="py-3">
            <InfoBox
              message={`No friends found matching "${searchQuery}".`}
              className="py-4"
            />
          </Box>
        ) : (
          <VStack space="sm" className="pt-1">
            {filteredFriends.map((item) => (
              <Pressable
                key={item.user.id}
                onPress={() => onSelectFriend(item)}
                testID={`select-friend-item-${item.user.id}`}
              >
                <Card
                  variant="elevated"
                  className="p-3 bg-background-50 border border-outline-100 rounded-lg"
                >
                  <HStack space="md" className="items-center justify-between">
                    <HStack space="md" className="items-center flex-1 pr-2">
                      <UserAvatar username={item.user.username} isHighlighted={true} />
                      <VStack className="flex-1">
                        <Text
                          size="sm"
                          className="font-bold uppercase text-typography-0"
                          numberOfLines={1}
                        >
                          {item.user.username}
                        </Text>
                        <Text size="xs" className="font-medium text-typography-400 mt-0.5">
                          Steam ID: {item.user.steam_id}
                        </Text>
                      </VStack>
                    </HStack>

                    <Button
                      size="xs"
                      variant="solid"
                      action="primary"
                      onPress={() => onSelectFriend(item)}
                      testID={`compare-friend-btn-${item.user.id}`}
                    >
                      <ButtonText>Compare</ButtonText>
                    </Button>
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        )}
      </SectionCard>
    </VStack>
  );
};
