import { useMemo } from 'react';
import { parseRGB } from '@gamelog/common/charts/chartsHelpers';
import { tailwindColors } from '@gamelog/theme/theme';
import {
  GAME_STATUS_LABELS,
  GameStatus,
  CommunityGameStatusResponse,
} from '@gamelog/api-manager/dto';

export interface GameStatusPieItem {
  value: number;
  color: string;
  label: string;
  status: GameStatus;
}

export interface StatusComparisonItem {
  status: GameStatus;
  label: string;
  userPercentage: number;
  communityPercentage: number;
  color: string;
}

export const STATUS_ORDER: GameStatus[] = ['playing', 'to_be_played', 'shelved', 'platinato'];

import { HEX_COLORS } from '@gamelog/theme/hexColors';

export const STATUS_COLORS: Record<GameStatus, string> = {
  playing: HEX_COLORS.gameStatus.playing.hex,
  to_be_played: HEX_COLORS.gameStatus.to_be_played.hex,
  shelved: HEX_COLORS.gameStatus.shelved.hex,
  platinato: HEX_COLORS.gameStatus.platinato.hex,
};

export const formatCommunityGameCount = (count?: number | null): string => {
  if (count === null || count === undefined || isNaN(count)) return '0';
  if (count % 1 === 0) return count.toString();
  if (count >= 10) return Math.round(count).toString();
  return count.toFixed(1);
};

export interface UseCommunityGameStatusDataParams {
  data?: CommunityGameStatusResponse | null;
  emptyColor?: string;
}

export const useCommunityGameStatusData = ({
  data,
  emptyColor = "transparent",
}: UseCommunityGameStatusDataParams) => {
  const comparisonItems = useMemo<StatusComparisonItem[]>(() => {
    if (!data) return [];

    const userMap = new Map<GameStatus, number>();
    const commMap = new Map<GameStatus, number>();

    (data.user || []).forEach((item) => {
      userMap.set(item.status, Number(item.percentage) || 0);
    });

    (data.community || []).forEach((item) => {
      commMap.set(item.status, Number(item.percentage) || 0);
    });

    return STATUS_ORDER.map((status) => {
      const userPct = userMap.get(status) ?? 0;
      const commPct = commMap.get(status) ?? 0;
      return {
        status,
        label: GAME_STATUS_LABELS[status] || status,
        userPercentage: Number(userPct.toFixed(2)),
        communityPercentage: Number(commPct.toFixed(2)),
        color: STATUS_COLORS[status],
      };
    });
  }, [data]);

  const userPieData = useMemo<GameStatusPieItem[]>(() => {
    if (!data || !data.user || data.user.length === 0) {
      return [{ value: 1, color: emptyColor, label: 'Empty', status: 'playing' }];
    }

    const items: GameStatusPieItem[] = [];
    STATUS_ORDER.forEach((status) => {
      const found = data.user.find((u) => u.status === status);
      const val = found ? Number(found.percentage) || 0 : 0;
      if (val > 0) {
        items.push({
          value: val,
          color: STATUS_COLORS[status],
          label: GAME_STATUS_LABELS[status] || status,
          status,
        });
      }
    });

    if (items.length === 0) {
      return [{ value: 1, color: emptyColor, label: 'Empty', status: 'playing' }];
    }

    return items;
  }, [data, emptyColor]);

  const communityPieData = useMemo<GameStatusPieItem[]>(() => {
    if (!data || !data.community || data.community.length === 0) {
      return [{ value: 1, color: emptyColor, label: 'Empty', status: 'playing' }];
    }

    const items: GameStatusPieItem[] = [];
    STATUS_ORDER.forEach((status) => {
      const found = data.community.find((c) => c.status === status);
      const val = found ? Number(found.percentage) || 0 : 0;
      if (val > 0) {
        items.push({
          value: val,
          color: STATUS_COLORS[status],
          label: GAME_STATUS_LABELS[status] || status,
          status,
        });
      }
    });

    if (items.length === 0) {
      return [{ value: 1, color: emptyColor, label: 'Empty', status: 'playing' }];
    }

    return items;
  }, [data, emptyColor]);

  const userTotalGames = data?.user_num_of_games ?? 0;
  const communityTotalGamesFormatted = formatCommunityGameCount(data?.community_num_of_games);
  const hasData = Boolean(data && (data.user?.length > 0 || data.community?.length > 0));

  return {
    comparisonItems,
    userPieData,
    communityPieData,
    userTotalGames,
    communityTotalGamesFormatted,
    hasData,
  };
};
