import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { LoadingBox, ErrorBox, InfoBox } from '@gamelog/common/feedbacks';
import { FriendRecommendationsResponse } from '@gamelog/api-manager/dto';
import { SharedGenresSection } from './SharedGenresSection';
import { CommonGamesSection } from './CommonGamesSection';
import { TopRecommendedGamesSection } from './TopRecommendedGamesSection';

interface FriendRecommendationsContentProps {
  recommendations?: FriendRecommendationsResponse | null;
  isLoading: boolean;
  error: any;
  errorMessage?: string | null;
  friendName: string;
  gameNames: Record<string, string>;
  onCommonGamePress: (gameSteamId: string, requesterPlayTime: number) => void;
  onTopGamePress: (gameSteamId: string) => void;
}

export const FriendRecommendationsContent: React.FC<FriendRecommendationsContentProps> = ({
  recommendations,
  isLoading,
  error,
  errorMessage,
  friendName,
  gameNames,
  onCommonGamePress,
  onTopGamePress,
}) => {
  if (isLoading && !recommendations) {
    return (
      <Box className="px-4">
        <LoadingBox message={`Analyzing games for ${friendName}...`} className="py-10" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="px-4">
        <ErrorBox
          errorMessage={errorMessage || 'Failed to load recommendations'}
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
      {hasCommonGenres && recommendations.common_genres && (
        <SharedGenresSection genres={recommendations.common_genres} />
      )}

      {hasCommonGames && recommendations.common_games && (
        <CommonGamesSection
          commonGames={recommendations.common_games}
          friendName={friendName}
          gameNames={gameNames}
          onGamePress={onCommonGamePress}
        />
      )}

      {hasTopGames && recommendations.top_games && (
        <TopRecommendedGamesSection
          topGames={recommendations.top_games}
          gameNames={gameNames}
          onGamePress={onTopGamePress}
        />
      )}
    </VStack>
  );
};
