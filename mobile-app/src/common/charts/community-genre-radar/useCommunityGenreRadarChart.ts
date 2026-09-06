import { useState, useEffect, useMemo } from 'react';
import {
  buildGenreChartData,
  GenreChartItem,
} from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import { useCommunityGenre } from './useCommunityGenre';
import type { OwnedGames, CommunityScope } from '@gamelog/api-manager/dto';

export interface CommunityGenreComparisonItem {
  id: string;
  description: string;
  userPercentage: number;
  communityPercentage: number;
}

export const useCommunityGenreRadarChart = (
  ownedGames: OwnedGames | null | undefined,
  scope: CommunityScope,
  userId?: string
) => {
  const {
    communityGenres,
    isLoadingCommunity,
    errorCommunity,
    errorMessageCommunity,
    refetchCommunity,
  } = useCommunityGenre(scope, userId);

  const [userGenreData, setUserGenreData] = useState<GenreChartItem[]>([]);
  const [isLoadingUserGenres, setIsLoadingUserGenres] = useState(false);

  useEffect(() => {
    if (!ownedGames?.response?.games) {
      setUserGenreData([]);
      return;
    }

    let isMounted = true;
    setIsLoadingUserGenres(true);

    buildGenreChartData(ownedGames.response.games)
      .then((data) => {
        if (isMounted) {
          setUserGenreData(data);
          setIsLoadingUserGenres(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUserGenreData([]);
          setIsLoadingUserGenres(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ownedGames]);

  // Compute user genre percentage map
  const userGenrePercentages = useMemo(() => {
    const totalMinutes = userGenreData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const map = new Map<string, number>();

    if (totalMinutes > 0) {
      userGenreData.forEach((item) => {
        const pct = ((Number(item.value) || 0) / totalMinutes) * 100;
        map.set(item.label.toLowerCase().trim(), Number(pct.toFixed(2)));
      });
    }

    return map;
  }, [userGenreData]);

  // Build comparison items and aligned chart arrays
  const comparisonItems = useMemo<CommunityGenreComparisonItem[]>(() => {
    if (!communityGenres || communityGenres.length === 0) return [];
    return communityGenres.map((g) => {
      const commPct = Number(g.percentage) || 0;
      const userPct = userGenrePercentages.get(g.description.toLowerCase().trim()) ?? 0;
      return {
        id: g.id,
        description: g.description,
        userPercentage: userPct,
        communityPercentage: commPct,
      };
    });
  }, [communityGenres, userGenrePercentages]);

  const { userValues, communityValues, labels } = useMemo(() => {
    const uValues: number[] = [];
    const cValues: number[] = [];
    const lbls: string[] = [];

    comparisonItems.forEach((item) => {
      uValues.push(item.userPercentage);
      cValues.push(item.communityPercentage);
      lbls.push(item.description);
    });

    return {
      userValues: uValues,
      communityValues: cValues,
      labels: lbls,
    };
  }, [comparisonItems]);

  const dataSet = useMemo(() => {
    if (userValues.length === 0 && communityValues.length === 0) return [];
    return [userValues, communityValues];
  }, [userValues, communityValues]);

  const maxValue = useMemo(() => {
    const all = [...userValues, ...communityValues];
    return all.length > 0 ? Math.max(...all, 1) : 1;
  }, [userValues, communityValues]);

  const isLoading = isLoadingCommunity || isLoadingUserGenres;

  return {
    dataSet,
    userValues,
    communityValues,
    comparisonItems,
    labels,
    maxValue,
    isLoading,
    errorCommunity,
    errorMessageCommunity,
    refetchCommunity,
  };
};
