import React from 'react';
import { Image, ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { useGetFriendRecommendations } from '@gamelog/api-manager/useApi';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { UserSearchResult } from '@gamelog/api-manager/dto';

interface FriendRecommendationsViewProps {
  friendItem: UserSearchResult;
  onClose: () => void;
}

export const FriendRecommendationsView: React.FC<FriendRecommendationsViewProps> = ({
  friendItem,
  onClose,
}) => {
  const friendId = friendItem.user.id;
  const friendName = friendItem.user.username;

  const {
    recommendations,
    isLoadingRecommendations,
    errorRecommendations,
    errorMessageRecommendations,
  } = useGetFriendRecommendations(friendId);

  const formatHours = (minutes: number) => {
    const hrs = Math.round(minutes / 60);
    return `${hrs}h`;
  };

  return (
    <Box className="relative overflow-hidden rounded-lg bg-background-100 shadow-xl p-5 h-4/5 flex-col">
      <HStack className="justify-between items-center mb-4">
        <VStack>
          <Text size="xl" className="font-bold uppercase">
            Recommendations
          </Text>
          <Text size="xs" className="text-typography-400 mt-0.5">
            Based on common activity with {friendName}
          </Text>
        </VStack>
        <Button
          size="xs"
          variant="outline"
          action="secondary"
          onPress={onClose}
          testID="close-recommendations-btn"
        >
          <ButtonText>Close</ButtonText>
        </Button>
      </HStack>

      {isLoadingRecommendations ? (
        <LoadingBox message={`Analyzing games for ${friendName}...`} className="py-8" />
      ) : errorRecommendations ? (
        <ErrorBox
          errorMessage={errorMessageRecommendations || 'Failed to load recommendations'}
          className="py-6"
        />
      ) : !recommendations ||
        (recommendations.common_games.length === 0 &&
          recommendations.common_genres.length === 0 &&
          recommendations.top_games.length === 0) ? (
        <InfoBox message={`No recommendation data available for ${friendName}.`} className="py-6" />
      ) : (
        <ScrollView className="flex-1 space-y-4">
          {/* Common Games Section */}
          {recommendations.common_games && recommendations.common_games.length > 0 && (
            <VStack className="mb-4">
              <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
                Common Games Played
              </Text>
              {recommendations.common_games.map((cg, idx) => (
                <Box
                  key={idx}
                  className="relative overflow-hidden rounded-lg mb-2 bg-background-200 shadow-md"
                >
                  <HStack space="md" className="px-3 py-3 items-center">
                    <Image
                      source={{ uri: steamAssetUrls.getGameCapsuleImage(cg.gameSteamId) }}
                      className="w-16 h-16 rounded-md bg-background-300 shrink-0"
                      resizeMode="cover"
                    />
                    <VStack className="flex-1">
                      <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
                        App ID: {cg.gameSteamId}
                      </Text>
                      <HStack space="md" className="mt-0.5">
                        <Text size="xs" className="font-medium text-typography-400">
                          You:{' '}
                          <Text size="xs" className="font-bold text-success-700">
                            {formatHours(cg.requester_play_time)}
                          </Text>
                        </Text>
                        <Text size="xs" className="font-medium text-typography-400">
                          {friendName}:{' '}
                          <Text size="xs" className="font-bold text-warning-700">
                            {formatHours(cg.friend_play_time)}
                          </Text>
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Common Genres Section */}
          {recommendations.common_genres && recommendations.common_genres.length > 0 && (
            <VStack className="mb-4">
              <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
                Shared Genres
              </Text>
              <HStack className="flex-wrap gap-2">
                {recommendations.common_genres.map((genre, idx) => (
                  <Box key={idx} className="bg-primary-500/15 px-2 py-0.5 rounded-md">
                    <Text size="xs" className="font-bold uppercase text-primary-700">
                      {genre.description || genre.id}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </VStack>
          )}

          {/* Top Games Section */}
          {recommendations.top_games && recommendations.top_games.length > 0 && (
            <VStack className="mb-2">
              <Text size="sm" className="font-bold uppercase text-typography-400 mb-2">
                Recommended Top Games
              </Text>
              {recommendations.top_games.map((tg, idx) => (
                <Box
                  key={idx}
                  className="relative overflow-hidden rounded-lg mb-2 bg-background-200 shadow-md"
                >
                  <HStack space="md" className="px-3 py-3 items-center">
                    <Image
                      source={{ uri: steamAssetUrls.getGameCapsuleImage(tg.gameSteamId) }}
                      className="w-16 h-16 rounded-md bg-background-300 shrink-0"
                      resizeMode="cover"
                    />
                    <VStack className="flex-1">
                      <Text size="sm" className="font-bold uppercase" numberOfLines={1}>
                        App ID: {tg.gameSteamId}
                      </Text>
                      {tg.keys && tg.keys.length > 0 && (
                        <Text size="xs" className="text-typography-500 mt-1" numberOfLines={2}>
                          Tags: {tg.keys.map((k) => k.description || k.id).join(', ')}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </ScrollView>
      )}
    </Box>
  );
};
