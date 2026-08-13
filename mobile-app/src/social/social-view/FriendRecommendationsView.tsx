import { useState, useEffect } from 'react';
import { Image, ScrollView, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { useGetFriendRecommendations } from '@gamelog/api-manager/useApi';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import ApiManager from '@gamelog/api-manager/apiManager';
import { UserSearchResult } from '@gamelog/api-manager/dto';

interface FriendRecommendationsViewProps {
  friendItem: UserSearchResult;
  onClose: () => void;
}

export const FriendRecommendationsView: React.FC<FriendRecommendationsViewProps> = ({
  friendItem,
  onClose,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const friendId = friendItem.user.id;
  const friendName = friendItem.user.username;

  const {
    recommendations,
    isLoadingRecommendations,
    errorRecommendations,
    errorMessageRecommendations,
  } = useGetFriendRecommendations(friendId);

  const [gameNames, setGameNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!recommendations) return;

    const appIds: string[] = [];
    if (recommendations.common_games) {
      recommendations.common_games.forEach((cg) => {
        if (cg.gameSteamId) appIds.push(String(cg.gameSteamId));
      });
    }
    if (recommendations.top_games) {
      recommendations.top_games.forEach((tg) => {
        if (tg.gameSteamId) appIds.push(String(tg.gameSteamId));
      });
    }

    if (appIds.length === 0) return;

    let isMounted = true;

    const fetchGameNames = async () => {
      const results = await Promise.allSettled(
        appIds.map(async (appId) => {
          const response = await ApiManager.getGameBasicInfo(appId);
          return { appId, name: response?.[appId]?.data?.name };
        })
      );

      if (!isMounted) return;

      const newNames: Record<string, string> = {};
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value.name) {
          newNames[res.value.appId] = res.value.name;
        }
      });

      if (Object.keys(newNames).length > 0) {
        setGameNames((prev) => ({ ...prev, ...newNames }));
      }
    };

    fetchGameNames();

    return () => {
      isMounted = false;
    };
  }, [recommendations]);

  const formatHours = (minutes: number) => {
    const hrs = Math.round(minutes / 60);
    return `${hrs}h`;
  };

  const handleGamePress = (gameSteamId: string, requesterPlayTime: number) => {
    const displayName = gameNames[gameSteamId] || `App ID: ${gameSteamId}`;
    onClose();
    navigation.navigate('GameList', {
      screen: 'Game',
      params: {
        gameItem: {
          appid: gameSteamId,
          name: displayName,
          playtime_forever: requesterPlayTime || 0,
        },
      },
    });
  };

  return (
    <Box className="relative overflow-hidden rounded-lg bg-background-100 shadow-xl p-5 h-4/5 flex-col">
      <Box className="relative mb-4 items-center">
        <VStack className="items-center px-8">
          <Text size="2xl" className="font-bold uppercase text-primary-700">
            Recommendations
          </Text>
          <Text size="sm" className="text-typography-400 mt-0.5">
            Based on common activity with {friendName}
          </Text>
        </VStack>
        <Box className="absolute right-0 top-0">
          <Button
            size="xs"
            variant="outline"
            action="secondary"
            onPress={onClose}
            testID="close-recommendations-btn"
          >
            <ButtonText>Close</ButtonText>
          </Button>
        </Box>
      </Box>

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
          {/* Common Genres Section */}
          {recommendations.common_genres && recommendations.common_genres.length > 0 && (
            <VStack className="mb-4">
              <Text size="md" className="font-bold uppercase text-typography-400 mb-2 text-center">
                Shared Genres
              </Text>
              <HStack className="flex-wrap gap-2 justify-center">
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

          {/* Common Games Section */}
          {recommendations.common_games && recommendations.common_games.length > 0 && (
            <VStack className="mb-4">
              <Text size="md" className="font-bold uppercase text-typography-400 mb-2 text-center">
                Common Games Played
              </Text>
              {recommendations.common_games.map((cg, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => console.log('Go to game details for App ID:', cg.gameSteamId)}
                >
                  <Card variant="elevated" className="relative mb-2 p-0">
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
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}

          {/* Top Games Section */}
          {recommendations.top_games && recommendations.top_games.length > 0 && (
            <VStack className="mb-2">
              <Text size="md" className="font-bold uppercase text-typography-400 mb-2 text-center">
                Recommended Top Games
              </Text>
              {recommendations.top_games.map((tg, idx) => (
                <Pressable
                  key={idx}
                  onPress={() =>
                    Linking.openURL(`https://store.steampowered.com/app/${tg.gameSteamId}`)
                  }
                >
                  <Card variant="elevated" className="relative mb-2 p-0">
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
                  </Card>
                </Pressable>
              ))}
            </VStack>
          )}
        </ScrollView>
      )}
    </Box>
  );
};
