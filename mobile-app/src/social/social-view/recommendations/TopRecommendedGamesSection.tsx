import React from 'react';
import SectionCard from '@gamelog/common/SectionCard';
import CompactGameList from '@gamelog/common/CompactGameList';
import { TopGameResult } from '@gamelog/api-manager/dto';

interface TopRecommendedGamesSectionProps {
  topGames: TopGameResult[];
  gameNames: Record<string, string>;
  onGamePress: (gameSteamId: string) => void;
}

export const TopRecommendedGamesSection: React.FC<TopRecommendedGamesSectionProps> = ({
  topGames,
  gameNames,
  onGamePress,
}) => {
  if (!topGames || topGames.length === 0) return null;

  const items = topGames.map((tg) => ({
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
  }));

  return (
    <SectionCard label={`Recommended Top Games (${topGames.length})`}>
      <CompactGameList
        items={items}
        gameNames={gameNames}
        handleGamePress={(appId) => onGamePress(appId)}
      />
    </SectionCard>
  );
};
