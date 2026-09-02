import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';

interface FriendRecommendationsHeaderProps {
  isSelectingFriend: boolean;
  activeFriendName?: string;
}

export const FriendRecommendationsHeader: React.FC<FriendRecommendationsHeaderProps> = ({
  isSelectingFriend,
  activeFriendName,
}) => {
  const subtitle =
    isSelectingFriend || !activeFriendName
      ? 'Search or select a friend to compare games and recommendations'
      : `Comparing games and shared tastes with ${activeFriendName}`;

  return (
    <Box className="px-4 pt-2 pb-3">
      <PageTitle size="2xl" className="font-bold uppercase tracking-wide">
        Game Recommender
      </PageTitle>
      <Text size="sm" className="text-typography-400 mt-1">
        {subtitle}
      </Text>
    </Box>
  );
};
