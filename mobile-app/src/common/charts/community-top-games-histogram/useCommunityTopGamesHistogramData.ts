import { useState, useEffect, useMemo, useRef } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import type { CommunityTopGame, OwnedGames } from '@gamelog/api-manager/dto';

export interface TopGameDisplayItem {
  id: string;
  rank: number;
  name: string;
  userPlaytime: number;
  communityPlaytime: number;
  userFormatted: string;
  communityFormatted: string;
  userPercent: number;
  communityPercent: number;
}

export interface UseCommunityTopGamesHistogramDataProps {
  data: CommunityTopGame[] | null | undefined;
  ownedGames?: OwnedGames | null;
}

export const formatHoursToDisplay = (decimalHours: number): string => {
  if (!decimalHours || decimalHours <= 0) return '0m';
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export const useCommunityTopGamesHistogramData = ({
  data,
  ownedGames,
}: UseCommunityTopGamesHistogramDataProps) => {
  const [fetchedNames, setFetchedNames] = useState<Record<string, string>>({});

  // Build a lookup map of game names from ownedGames
  const ownedGameNames = useMemo(() => {
    const map = new Map<string, string>();
    if (ownedGames?.response?.games) {
      ownedGames.response.games.forEach((g) => {
        if (g.appid && g.name) {
          map.set(String(g.appid), g.name);
        }
      });
    }
    return map;
  }, [ownedGames]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const dataIds = useMemo(() => {
    if (!data) return '';
    return data.map((item) => String(item.id)).join(',');
  }, [data]);

  // Async fetch missing game titles using getGameBasicInfo
  useEffect(() => {
    if (!data || data.length === 0) return;

    const missingIds = data
      .map((item) => String(item.id))
      .filter((appId) => !ownedGameNames.has(appId) && !fetchedNames[appId]);

    if (missingIds.length === 0) return;

    const fetchGameTitles = async () => {
      const results = await Promise.allSettled(
        missingIds.map(async (appId) => {
          const response = await ApiManager.getGameBasicInfo(appId);
          return { appId, name: response?.[appId]?.data?.name };
        })
      );

      if (!isMountedRef.current) return;

      const newNames: Record<string, string> = {};
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.name) {
          newNames[res.value.appId] = res.value.name;
        }
      });

      if (Object.keys(newNames).length > 0 && isMountedRef.current) {
        setFetchedNames((prev) => ({ ...prev, ...newNames }));
      }
    };

    fetchGameTitles();
  }, [dataIds, ownedGameNames]);

  // Find max playtime across all candidates to proportionally scale bar widths
  const maxPlaytime = useMemo(() => {
    if (!data || data.length === 0) return 1;
    let max = 0;
    data.forEach((item) => {
      const u = Number(item.user_playtime) || 0;
      const c = Number(item.community_playtime) || 0;
      if (u > max) max = u;
      if (c > max) max = c;
    });
    return max > 0 ? max : 1;
  }, [data]);

  const topGamesItems = useMemo<TopGameDisplayItem[]>(() => {
    if (!data || data.length === 0) return [];

    return data.map((item, index) => {
      const appId = String(item.id);
      const name =
        ownedGameNames.get(appId) || fetchedNames[appId] || `Game #${appId}`;
      const userPlaytime = Number(item.user_playtime) || 0;
      const communityPlaytime = Number(item.community_playtime) || 0;

      const userPercent = Math.min(100, Math.max(0, (userPlaytime / maxPlaytime) * 100));
      const communityPercent = Math.min(
        100,
        Math.max(0, (communityPlaytime / maxPlaytime) * 100)
      );

      return {
        id: appId,
        rank: index + 1,
        name,
        userPlaytime,
        communityPlaytime,
        userFormatted: formatHoursToDisplay(userPlaytime),
        communityFormatted: formatHoursToDisplay(communityPlaytime),
        userPercent,
        communityPercent,
      };
    });
  }, [data, ownedGameNames, fetchedNames, maxPlaytime]);

  const hasData = topGamesItems.length > 0;

  return {
    topGamesItems,
    hasData,
    maxPlaytime,
  };
};
