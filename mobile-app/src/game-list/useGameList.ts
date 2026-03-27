import { useMemo, useState } from 'react';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { GameItem } from '@gamelog/api-manager/dto';

export type SortBy = 'name' | 'playtime';

const SORT_STRATEGIES: Record<SortBy, (a: GameItem, b: GameItem) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  playtime: (a, b) => b.playtime_forever - a.playtime_forever,
};

type UseGameListResult = {
  processedGames: GameItem[];
  isLoading: boolean;
  error: boolean;
  errorMessage: string | null;
  isEmpty: boolean;
  noResults: boolean;
  sortBy: SortBy;
  handleSortChange: (newSort: SortBy) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

export const useGameList = (playerID: string): UseGameListResult => {
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames, errorMessageOwnedGames } =
    useGetOwnedGames(playerID, true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('playtime');
  const [isProcessing, setIsProcessing] = useState(false);

  const processedGames = useMemo(() => {
    if (!ownedGames?.response?.games) return [];
    return [...ownedGames.response.games]
      .filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort(SORT_STRATEGIES[sortBy]);
  }, [ownedGames, searchQuery, sortBy]);

  const handleSortChange = (newSort: SortBy) => {
    setIsProcessing(true);
    setSortBy(newSort);
    setTimeout(() => setIsProcessing(false), 200);
  };

  return {
    processedGames,
    isLoading: isProcessing || isLoadingOwnedGames,
    error: errorOwnedGames,
    errorMessage: errorMessageOwnedGames,
    isEmpty: !ownedGames?.response?.games?.length,
    noResults: processedGames.length === 0,
    sortBy,
    handleSortChange,
    searchQuery,
    setSearchQuery,
  };
};
