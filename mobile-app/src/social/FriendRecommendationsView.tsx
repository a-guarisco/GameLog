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
    <Box className="bg-background-100 rounded-2xl p-5 border border-outline-200 max-h-5/6 shadow-2xl">
      <HStack className="justify-between items-center mb-4 pb-3 border-b border-outline-100">
        <VStack>
          <Text className="text-xl font-bold text-white">Recommendations</Text>
          <Text className="text-xs text-typography-400">
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
        <ScrollView className="space-y-4">
          {/* Common Games Section */}
          {recommendations.common_games && recommendations.common_games.length > 0 && (
            <VStack className="mb-4">
              <Text className="text-base font-bold text-primary-400 mb-2 uppercase tracking-wider">
                Common Games Played
              </Text>
              {recommendations.common_games.map((cg, idx) => (
                <Box
                  key={idx}
                  className="bg-background-200 p-3 rounded-lg mb-2 border border-outline-100 flex-row items-center space-x-3"
                >
                  <Image
                    source={{ uri: steamAssetUrls.getGameCapsuleImage(cg.gameSteamId) }}
                    className="w-24 h-12 rounded bg-background-300"
                    resizeMode="cover"
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      App ID: {cg.gameSteamId}
                    </Text>
                    <HStack className="space-x-3 mt-1">
                      <Text className="text-xs text-typography-300">
                        You:{' '}
                        <Text className="font-bold text-emerald-400">
                          {formatHours(cg.requester_play_time)}
                        </Text>
                      </Text>
                      <Text className="text-xs text-typography-300">
                        {friendName}:{' '}
                        <Text className="font-bold text-amber-400">
                          {formatHours(cg.friend_play_time)}
                        </Text>
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Common Genres Section */}
          {recommendations.common_genres && recommendations.common_genres.length > 0 && (
            <VStack className="mb-4">
              <Text className="text-base font-bold text-primary-400 mb-2 uppercase tracking-wider">
                Shared Genres
              </Text>
              <HStack className="flex-wrap gap-2">
                {recommendations.common_genres.map((genre, idx) => (
                  <Box
                    key={idx}
                    className="bg-primary-900/40 border border-primary-500/30 px-3 py-1 rounded-full"
                  >
                    <Text className="text-xs text-primary-300 font-medium">
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
              <Text className="text-base font-bold text-primary-400 mb-2 uppercase tracking-wider">
                Recommended Top Games
              </Text>
              {recommendations.top_games.map((tg, idx) => (
                <Box
                  key={idx}
                  className="bg-background-200 p-3 rounded-lg mb-2 border border-outline-100 flex-row items-center space-x-3"
                >
                  <Image
                    source={{ uri: steamAssetUrls.getGameCapsuleImage(tg.gameSteamId) }}
                    className="w-24 h-12 rounded bg-background-300"
                    resizeMode="cover"
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      App ID: {tg.gameSteamId}
                    </Text>
                    {tg.keys && tg.keys.length > 0 && (
                      <Text className="text-xs text-typography-400 mt-1">
                        Tags: {tg.keys.map((k) => k.description || k.id).join(', ')}
                      </Text>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ScrollView>
      )}
    </Box>
  );
};
