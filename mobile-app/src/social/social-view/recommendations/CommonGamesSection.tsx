import React from 'react';
import SectionCard from '@gamelog/common/SectionCard';
import CompactGameList from '@gamelog/common/CompactGameList';
import { CommonGameResult } from '@gamelog/api-manager/dto';

interface CommonGamesSectionProps {
  commonGames: CommonGameResult[];
  friendName: string;
  gameNames: Record<string, string>;
  onGamePress: (gameSteamId: string, requesterPlayTime: number) => void;
}

const formatHours = (minutes: number) => {
  const hrs = Math.round(minutes / 60);
  return `${hrs}h`;
};

export const CommonGamesSection: React.FC<CommonGamesSectionProps> = ({
  commonGames,
  friendName,
  gameNames,
  onGamePress,
}) => {
  if (!commonGames || commonGames.length === 0) return null;

  const items = commonGames.map((cg) => ({
    testID: `common-game-item-${cg.gameSteamId}`,
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
  }));

  return (
    <SectionCard label={`Common Games Played (${commonGames.length})`}>
      <CompactGameList
        items={items}
        gameNames={gameNames}
        handleGamePress={(appId, playTime) => onGamePress(appId, playTime)}
      />
    </SectionCard>
  );
};
