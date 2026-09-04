import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import BackButton from '@gamelog/common/BackButton';
import { UserSearchResult } from '@gamelog/api-manager/dto';
import {
  FriendRecommendationsHeader,
  ActiveFriendBanner,
  FriendRecommendationsSearcher,
  FriendRecommendationsContent,
  useFriendRecommendationsView,
} from './recommendations';

interface FriendRecommendationsViewProps {
  friendItem?: UserSearchResult;
  onClose?: () => void;
}

export const FriendRecommendationsView: React.FC<FriendRecommendationsViewProps> = ({
  friendItem,
  onClose,
}) => {
  const {
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
    recommendations,
    isLoadingRecommendations,
    errorRecommendations,
    errorMessageRecommendations,
    gameNames,
    handleSelectFriend,
    handleStartSelectingFriend,
    handleCommonGamePress,
    handleTopGamePress,
    handleBack,
  } = useFriendRecommendationsView({ friendItem, onClose });

  return (
    <Box className="flex-1 relative bg-background-0">
      <ScrollablePage hasBanner={false}>
        <FriendRecommendationsHeader
          isSelectingFriend={isSelectingFriend}
          activeFriendName={activeFriend?.user?.username}
        />

        {!isSelectingFriend && activeFriend && (
          <ActiveFriendBanner
            friendName={friendName}
            steamId={activeFriend?.user?.steam_id}
            onChangeFriend={handleStartSelectingFriend}
          />
        )}

        {isSelectingFriend || !activeFriend ? (
          <FriendRecommendationsSearcher
            searchQuery={searchFriendQuery}
            onSearchQueryChange={setSearchFriendQuery}
            filteredFriends={filteredFriends}
            totalFriendsCount={acceptedFriends.length}
            isLoading={isLoadingFriendList}
            error={errorFriendList}
            errorMessage={errorMessageFriendList}
            onSelectFriend={handleSelectFriend}
          />
        ) : (
          <FriendRecommendationsContent
            recommendations={recommendations}
            isLoading={isLoadingRecommendations}
            error={errorRecommendations}
            errorMessage={errorMessageRecommendations}
            friendName={friendName}
            gameNames={gameNames}
            onCommonGamePress={handleCommonGamePress}
            onTopGamePress={handleTopGamePress}
          />
        )}
      </ScrollablePage>

      <BackButton onPress={handleBack} testID="recommendations-back-btn" />
    </Box>
  );
};

export default FriendRecommendationsView;
