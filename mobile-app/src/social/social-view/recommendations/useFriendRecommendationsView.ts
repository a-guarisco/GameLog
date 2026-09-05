import { useState, useMemo, useCallback } from 'react';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetFriendRecommendations, useGetFriendList } from '@gamelog/api-manager/useApi';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import { selectAcceptedFriends } from '../friendListSelectors';
import { useRecommendationsGameNames } from './useRecommendationsGameNames';

interface UseFriendRecommendationsViewProps {
  friendItem?: UserSearchResult;
  onClose?: () => void;
}

export const useFriendRecommendationsView = ({
  friendItem: propFriendItem,
  onClose,
}: UseFriendRecommendationsViewProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();

  const initialFriend: UserSearchResult | undefined = propFriendItem || route.params?.friendItem;

  const [activeFriend, setActiveFriend] = useState<UserSearchResult | undefined>(initialFriend);
  const [isSelectingFriend, setIsSelectingFriend] = useState<boolean>(!initialFriend);
  const [searchFriendQuery, setSearchFriendQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    friendList,
    isLoadingFriendList,
    errorFriendList,
    errorMessageFriendList,
    refetchFriendList,
  } = useGetFriendList();
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
    refetchRecommendations,
  } = useGetFriendRecommendations(friendId);

  const gameNames = useRecommendationsGameNames(recommendations);

  const handleSelectFriend = (friend: UserSearchResult) => {
    setActiveFriend(friend);
    setIsSelectingFriend(false);
    setSearchFriendQuery('');
  };

  const handleStartSelectingFriend = () => {
    setIsSelectingFriend(true);
  };

  const handleCommonGamePress = (gameSteamId: string, requesterPlayTime: number) => {
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

  const handleTopGamePress = (gameSteamId: string) => {
    Linking.openURL(`https://store.steampowered.com/app/${gameSteamId}`);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSelectingFriend || !activeFriend) {
        await refetchFriendList();
      } else {
        await Promise.all([refetchRecommendations(), refetchFriendList()]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [isSelectingFriend, activeFriend, refetchRecommendations, refetchFriendList]);

  return {
    activeFriend,
    friendName,
    isSelectingFriend,
    searchFriendQuery,
    setSearchFriendQuery,
    acceptedFriends,
    filteredFriends,
    isLoadingFriendList,
    errorFriendList,
    errorMessageFriendList,
    refetchFriendList,
    recommendations,
    isLoadingRecommendations,
    errorRecommendations,
    errorMessageRecommendations,
    refetchRecommendations,
    gameNames,
    refreshing,
    handleRefresh,
    handleSelectFriend,
    handleStartSelectingFriend,
    handleCommonGamePress,
    handleTopGamePress,
    handleBack,
  };
};
