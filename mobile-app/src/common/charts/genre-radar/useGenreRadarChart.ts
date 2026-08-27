import { useMemo, useState, useEffect } from 'react';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import {
  buildGenreChartData,
  GenreChartItem,
} from '@gamelog/common/charts/genre-radar/buildGenreChartData';
import type { OwnedGames } from '@gamelog/api-manager/dto';

export const useGenreRadarChart = (ownedGames: OwnedGames | null | undefined) => {
  const [genreChartData, setGenreChartData] = useState<GenreChartItem[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  useEffect(() => {
    if (!ownedGames?.response?.games) {
      setGenreChartData([]);
      return;
    }

    let isMounted = true;
    setIsLoadingGenres(true);

    buildGenreChartData(ownedGames.response.games)
      .then((data) => {
        if (isMounted) {
          setGenreChartData(data);
          setIsLoadingGenres(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setGenreChartData([]);
          setIsLoadingGenres(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ownedGames]);

  const values = useMemo(
    () => genreChartData.map((d: any) => Number(d.value) || 0),
    [genreChartData]
  );

  const labels = useMemo(
    () =>
      genreChartData.map((d: any) => `${d.label}\n${formatMinutesToHours(Number(d.value) || 0)}`),
    [genreChartData]
  );

  return {
    values,
    labels,
    isLoadingGenres,
  };
};
