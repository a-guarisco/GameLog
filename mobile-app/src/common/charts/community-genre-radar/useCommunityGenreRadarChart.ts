import { useState, useEffect, useMemo } from 'react';
import { buildGenreChartData, GenreChartItem } from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import { useCommunityGenre } from './useCommunityGenre';
import type { OwnedGames, CommunityScope } from '@gamelog/api-manager/dto';

export const useCommunityGenreRadarChart = (
  ownedGames: OwnedGames | null | undefined,
  scope: CommunityScope
) => {
  const {
    communityGenres,
    isLoadingCommunity,
    errorCommunity,
    errorMessageCommunity,
    refetchCommunity,
  } = useCommunityGenre(scope);

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

  // Align axes according to community genres
  const { userValues, communityValues, labels } = useMemo(() => {
    if (!communityGenres || communityGenres.length === 0) {
      return { userValues: [], communityValues: [], labels: [] };
    }

    const uValues: number[] = [];
    const cValues: number[] = [];
    const lbls: string[] = [];

    communityGenres.forEach((g) => {
      const commPct = Number(g.percentage) || 0;
      const userPct = userGenrePercentages.get(g.description.toLowerCase().trim()) ?? 0;

      uValues.push(userPct);
      cValues.push(commPct);
      lbls.push(`${g.description}\n${userPct}% · ${commPct}%`);
    });

    return {
      userValues: uValues,
      communityValues: cValues,
      labels: lbls,
    };
  }, [communityGenres, userGenrePercentages]);

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
    labels,
    maxValue,
    isLoading,
    errorCommunity,
    errorMessageCommunity,
    refetchCommunity,
  };
};
