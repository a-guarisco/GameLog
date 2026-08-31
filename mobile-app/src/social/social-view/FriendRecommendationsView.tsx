import { useState, useEffect, useMemo } from 'react';
import { Pressable, Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { Text } from '@gamelog/common/gluestack/text';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { useGetFriendRecommendations, useGetFriendList } from '@gamelog/api-manager/useApi';
import ApiManager from '@gamelog/api-manager/apiManager';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import SectionCard from '@gamelog/common/SectionCard';
import Chip from '@gamelog/common/Chip';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import CompactGameList from '@gamelog/common/CompactGameList';
import { selectAcceptedFriends } from './friendListSelectors';
import { UserAvatar } from '../user-card/UserAvatar';

interface FriendRecommendationsViewProps {
  friendItem?: UserSearchResult;
  onClose?: () => void;
}

export const FriendRecommendationsView: React.FC<FriendRecommendationsViewProps> = ({
  friendItem: propFriendItem,
  onClose,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();

  const initialFriend: UserSearchResult | undefined = propFriendItem || route.params?.friendItem;

  const [activeFriend, setActiveFriend] = useState<UserSearchResult | undefined>(initialFriend);
  const [isSelectingFriend, setIsSelectingFriend] = useState<boolean>(!initialFriend);
  const [searchFriendQuery, setSearchFriendQuery] = useState<string>('');
  const [gameNames, setGameNames] = useState<Record<string, string>>({});

  const { friendList, isLoadingFriendList, errorFriendList, errorMessageFriendList } =
    useGetFriendList();
  const acceptedFriends = selectAcceptedFriends(friendList);

  const filteredFriends = useMemo(() => {
    if (!searchFriendQuery.trim()) return acceptedFriends;
    return acceptedFriends.filter((f) =>
      f.user.username.toLowerCase().includes(searchFriendQuery.toLowerCase().trim())
    );
  }, [acceptedFriends, searchFriendQuery]);

  const friendId = activeFriend?.user?.id || '';
  const friendName = activeFriend?.user?.username || 'Friend';

  const {
    recommendations,
    isLoadingRecommendations,
    errorRecommendations,
    errorMessageRecommendations,
  } = useGetFriendRecommendations(friendId);

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

  const handleSelectFriend = (friend: UserSearchResult) => {
    setActiveFriend(friend);
    setIsSelectingFriend(false);
    setSearchFriendQuery('');
  };

  const handleGamePress = (gameSteamId: string, requesterPlayTime: number) => {
    const displayName = gameNames[gameSteamId] || `App ID: ${gameSteamId}`;
    if (onClose) onClose();
    navigation.navigate('GameListTab', {
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

  const handleBack = () => {
    if (isSelectingFriend && activeFriend) {
      setIsSelectingFriend(false);
      return;
    }
    if (onClose) {
      onClose();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // --- Render Friend Search / Picker View ---
  const renderFriendSearcher = () => {
    if (isLoadingFriendList) {
      return (
        <Box className="px-4">
          <LoadingBox message="Loading friends..." className="py-10" />
        </Box>
      );
    }

    if (errorFriendList) {
      return (
        <Box className="px-4">
          <ErrorBox
            errorMessage={errorMessageFriendList || 'Failed to load friends list.'}
            className="py-8"
          />
        </Box>
      );
    }

    if (acceptedFriends.length === 0) {
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
            value={searchFriendQuery}
            onChangeText={setSearchFriendQuery}
            testID="friend-search-input"
          />
        </Box>

        <SectionCard
          label={
            searchFriendQuery
              ? `Matching Friends (${filteredFriends.length})`
              : `Select a Friend (${acceptedFriends.length})`
          }
        >
          {filteredFriends.length === 0 ? (
            <Box className="py-3">
              <InfoBox
                message={`No friends found matching "${searchFriendQuery}".`}
                className="py-4"
              />
            </Box>
          ) : (
            <VStack space="sm" className="pt-1">
              {filteredFriends.map((item) => (
                <Pressable
                  key={item.user.id}
                  onPress={() => handleSelectFriend(item)}
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
                        onPress={() => handleSelectFriend(item)}
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

  // --- Render Recommendations Content View ---
  const renderRecommendationsContent = () => {
    if (isLoadingRecommendations) {
      return (
        <Box className="px-4">
          <LoadingBox message={`Analyzing games for ${friendName}...`} className="py-10" />
        </Box>
      );
    }

    if (errorRecommendations) {
      return (
        <Box className="px-4">
          <ErrorBox
            errorMessage={errorMessageRecommendations || 'Failed to load recommendations'}
            className="py-8"
          />
        </Box>
      );
    }

    const hasCommonGenres = Boolean(recommendations?.common_genres?.length);
    const hasCommonGames = Boolean(recommendations?.common_games?.length);
    const hasTopGames = Boolean(recommendations?.top_games?.length);

    if (!recommendations || (!hasCommonGenres && !hasCommonGames && !hasTopGames)) {
      return (
        <Box className="px-4">
          <InfoBox
            message={`No recommendation data available with ${friendName}.`}
            className="py-8"
          />
        </Box>
      );
    }

    return (
      <VStack space="xl" className="px-4">
        {/* Shared Genres */}
        {hasCommonGenres && (
          <SectionCard label="Shared Genres">
            <HStack className="flex-wrap gap-2 pt-1">
              {recommendations.common_genres.map((genre, idx) => (
                <Chip key={idx} className="bg-primary-500/15 border border-primary-500/30">
                  <Text size="xs" className="font-bold uppercase text-primary-700">
                    {genre.description || genre.id}
                  </Text>
                </Chip>
              ))}
            </HStack>
          </SectionCard>
        )}

        {/* Common Games Played */}
        {hasCommonGames && (
          <SectionCard label={`Common Games Played (${recommendations.common_games.length})`}>
            <CompactGameList
              items={recommendations.common_games.map((cg) => ({
                app_id: cg.gameSteamId,
                today_play_time: cg.requester_play_time,
                detail_rows: [
                  {
                    label: 'You:',
                    value: formatHours(cg.requester_play_time),
                    valueClassName: 'text-success-700',
                  },
                  {
                    label: `${friendName}:`,
                    value: formatHours(cg.friend_play_time),
                    valueClassName: 'text-warning-700',
                  },
                ],
              }))}
              gameNames={gameNames}
              handleGamePress={(appId, playTime) => handleGamePress(appId, playTime)}
            />
          </SectionCard>
        )}

        {/* Recommended Top Games */}
        {hasTopGames && (
          <SectionCard label={`Recommended Top Games (${recommendations.top_games.length})`}>
            <CompactGameList
              items={recommendations.top_games.map((tg) => ({
                app_id: tg.gameSteamId,
                detail_rows:
                  tg.keys && tg.keys.length > 0
                    ? [
                        {
                          label: 'Tags:',
                          value: tg.keys.map((k) => k.description || k.id).join(' · '),
                          valueClassName: 'text-typography-100',
                        },
                      ]
                    : [],
              }))}
              gameNames={gameNames}
              handleGamePress={(appId) =>
                Linking.openURL(`https://store.steampowered.com/app/${appId}`)
              }
            />
          </SectionCard>
        )}
      </VStack>
    );
  };

  return (
    <Box className="flex-1 relative bg-background-0">
      <ScrollablePage hasBanner={false}>
        {/* Header Title */}
        <Box className="px-4 pt-2 pb-3">
          <PageTitle size="2xl" className="font-bold uppercase tracking-wide">
            Game Recommender
          </PageTitle>
          <Text size="sm" className="text-typography-400 mt-1">
            {isSelectingFriend || !activeFriend
              ? 'Search or select a friend to compare games and recommendations'
              : `Comparing games and shared tastes with ${friendName}`}
          </Text>
        </Box>

        {/* Active Friend Banner with "Search Another Friend" Button */}
        {!isSelectingFriend && activeFriend && (
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
                  onPress={() => setIsSelectingFriend(true)}
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
        )}

        {isSelectingFriend || !activeFriend
          ? renderFriendSearcher()
          : renderRecommendationsContent()}
      </ScrollablePage>

      <BackButton onPress={handleBack} testID="recommendations-back-btn" />
    </Box>
  );
};

export default FriendRecommendationsView;
