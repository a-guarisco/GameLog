import React from 'react';
import StatBand, { GameStat } from '@gamelog/common/StatBand';
import { formatThousands } from '@gamelog/utils/formatUtils';
import type { FriendshipInfo, OwnedGames } from '@gamelog/api-manager/dto';

export const parseFriendshipDate = (sinceStr?: string | null): Date | null => {
  if (!sinceStr) return null;
  // If DD-MM-YYYY or DD/MM/YYYY
  const parts = sinceStr.split(/[-/]/);
  if (parts.length === 3 && parts[2].length === 4) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(sinceStr);
  return isNaN(d.getTime()) ? null : d;
};

export const formatRelationshipSince = (friendship?: FriendshipInfo | null): { label: string; value: string } => {
  const status = friendship?.friendship_status;
  const sinceStr = friendship?.since;

  let formattedDate: string | null = null;
  if (sinceStr) {
    try {
      const date = parseFriendshipDate(sinceStr);
      if (date) {
        formattedDate = date.toLocaleDateString(undefined, {
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = null;
    }
  }

  const sinceText = formattedDate ? `Since ${formattedDate}` : '—';

  if (status === 'accepted') {
    return { label: 'Friend', value: sinceText };
  }
  if (status === 'pending_incoming' || status === 'pending_outgoing') {
    return { label: 'Pending', value: sinceText };
  }
  if (status === 'blocked') {
    return { label: 'Blocked', value: sinceText };
  }
  return { label: 'Status', value: '—' };
};

export interface OtherUserStatsProps {
  ownedGames?: OwnedGames | null;
  friendship?: FriendshipInfo | null;
}

export const OtherUserStats: React.FC<OtherUserStatsProps> = ({
  ownedGames,
  friendship,
}) => {
  const games = ownedGames?.response?.games ?? [];
  const ownedCount = ownedGames?.response?.game_count ?? games.length;
  const totalHours = Math.floor(
    games.reduce((sum, game) => sum + (game.playtime_forever ?? 0), 0) / 60
  );

  const sinceStat = formatRelationshipSince(friendship);

  const stats: GameStat[] = [
    { value: formatThousands(ownedCount), label: 'Owned' },
    { value: sinceStat.value, label: sinceStat.label },
    { value: `${formatThousands(totalHours)} h`, label: 'Total' },
  ];

  return <StatBand stats={stats} testID="other-user-stat-band" />;
};

export default OtherUserStats;
