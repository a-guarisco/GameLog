import { useMemo, useState } from 'react';
import {
  useGetOwnedGames,
  useGetFullPlaytimeReport,
  useGetGenresBatch,
} from '@gamelog/api-manager/useApi';
import { GameItem } from '@gamelog/api-manager/dto';

export interface GameListItemData extends GameItem {
  genres: string[];
  maxPlaytimePerDay: number;
  streak: number;
}

export type SortBy = 'last_played' | 'playtime' | 'max_per_day' | 'top_platform';
export type PlatformFilter = 'All' | 'Windows' | 'Mac' | 'Linux' | 'Deck';

export type DateRange = {
  from?: Date;
  to?: Date;
};

export const useGameList = (playerID: string) => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames, errorMessageOwnedGames } =
    useGetOwnedGames(playerID, true, true);

  const { playtimeReport, isLoadingPlaytimeReport } = useGetFullPlaytimeReport();

  const appIds = useMemo(() => {
    if (!ownedGames?.response?.games) return [];
    return ownedGames.response.games.map((g) => String(g.appid));
  }, [ownedGames]);

  const { libraryGenres, isLoadingLibraryGenres } = useGetGenresBatch(appIds);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('playtime');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const unifiedGames = useMemo<GameListItemData[]>(() => {
    if (!ownedGames?.response?.games) return [];

    const reportsMap = new Map();
    if (playtimeReport?.game_reports) {
      playtimeReport.game_reports.forEach((r) => reportsMap.set(String(r.app_id), r));
    }

    const genresMap = libraryGenres || {};

    return ownedGames.response.games.map((game) => {
      const appId = String(game.appid);
      const report = reportsMap.get(appId);
      const genres = genresMap[appId] || [];

      return {
        ...game,
        genres,
        maxPlaytimePerDay: report?.max_playtime_per_day || 0,
        streak: report?.streak || 0,
      };
    });
  }, [ownedGames, playtimeReport, libraryGenres]);

  const processedGames = useMemo(() => {
    let result = [...unifiedGames];

    // 1. Text Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(lowerQuery));
    }

    // 2. Genre Filter
    if (genreFilter !== 'All') {
      result = result.filter((g) => g.genres.includes(genreFilter));
    }

    // 3. Platform Filter
    if (platformFilter !== 'All') {
      const platformKey = `playtime_${platformFilter.toLowerCase()}_forever` as keyof GameItem;
      result = result.filter((g) => (g[platformKey] as number) > 0);
    }

    // 4. Date Range Filter
    if (dateRangeFilter.from) {
      const fromTimestamp = Math.floor(dateRangeFilter.from.getTime() / 1000);
      result = result.filter((g) => g.rtime_last_played >= fromTimestamp);
    }
    if (dateRangeFilter.to) {
      const toTimestamp = Math.floor(dateRangeFilter.to.getTime() / 1000);
      result = result.filter((g) => g.rtime_last_played <= toTimestamp);
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'last_played':
          return b.rtime_last_played - a.rtime_last_played;
        case 'playtime':
          return b.playtime_forever - a.playtime_forever;
        case 'max_per_day':
          return b.maxPlaytimePerDay - a.maxPlaytimePerDay;
        case 'top_platform': {
          const aMax = Math.max(
            a.playtime_windows_forever,
            a.playtime_mac_forever,
            a.playtime_linux_forever,
            a.playtime_deck_forever
          );
          const bMax = Math.max(
            b.playtime_windows_forever,
            b.playtime_mac_forever,
            b.playtime_linux_forever,
            b.playtime_deck_forever
          );
          return bMax - aMax;
        }
        default:
          return 0;
      }
    });

    return result;
  }, [unifiedGames, searchQuery, genreFilter, platformFilter, dateRangeFilter, sortBy]);

  const handleSortChange = (newSort: SortBy) => {
    setIsProcessing(true);
    setSortBy(newSort);
    setTimeout(() => setIsProcessing(false), 200);
  };

  const allAvailableGenres = useMemo(() => {
    const set = new Set<string>();
    unifiedGames.forEach((g) => g.genres.forEach((genre) => set.add(genre)));
    return Array.from(set).sort();
  }, [unifiedGames]);

  return {
    processedGames,
    isLoading:
      isLoadingOwnedGames || isLoadingPlaytimeReport || isLoadingLibraryGenres || isProcessing,
    error: errorOwnedGames,
    errorMessage: errorMessageOwnedGames,
    isEmpty: !ownedGames?.response?.games?.length,
    noResults: processedGames.length === 0,

    // Filters state
    searchQuery,
    setSearchQuery,
    sortBy,
    handleSortChange,
    genreFilter,
    setGenreFilter,
    platformFilter,
    setPlatformFilter,
    dateRangeFilter,
    setDateRangeFilter,

    allAvailableGenres,
  };
};
