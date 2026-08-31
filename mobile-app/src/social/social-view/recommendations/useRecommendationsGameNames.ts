import { useState, useEffect } from 'react';
import ApiManager from '@gamelog/api-manager/apiManager';
import { FriendRecommendationsResponse } from '@gamelog/api-manager/dto';

export const useRecommendationsGameNames = (
  recommendations?: FriendRecommendationsResponse | null
) => {
  const [gameNames, setGameNames] = useState<Record<string, string>>({});

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

  return gameNames;
};
