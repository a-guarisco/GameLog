import React from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { GLTextInput } from '@gamelog/common/GLTextInput';
import { SearchIcon, CloseIcon } from '@gamelog/common/gluestack/icon';
import { SortBy, PlatformFilter as PlatformFilterType, StatusFilter as StatusFilterType, DateRange } from './useGameList';

import { SortFilter } from './filters/SortFilter';
import { GenreFilter } from './filters/GenreFilter';
import { StatusFilter } from './filters/StatusFilter';
import { PlatformFilter } from './filters/PlatformFilter';
import { DateFilter } from './filters/DateFilter';

interface GameListControlsProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  genreFilter: string;
  setGenreFilter: (g: string) => void;
  statusFilter: StatusFilterType;
  setStatusFilter: (s: StatusFilterType) => void;
  platformFilter: PlatformFilterType;
  setPlatformFilter: (p: PlatformFilterType) => void;
  dateRangeFilter: DateRange;
  setDateRangeFilter: (d: DateRange) => void;
  allAvailableGenres: string[];
}

export const GameListControls = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  onSortChange,
  genreFilter,
  setGenreFilter,
  statusFilter,
  setStatusFilter,
  platformFilter,
  setPlatformFilter,
  dateRangeFilter,
  setDateRangeFilter,
  allAvailableGenres,
}: GameListControlsProps) => {
  return (
    <VStack className="bg-background-0 pb-2">
      <Box className="px-4 pt-4 pb-2">
        <GLTextInput
          placeholder="Search games..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={(props: any) => <SearchIcon {...props} size="xl" />}
          rightIcon={searchQuery ? CloseIcon : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </Box>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
      >
        <SortFilter sortBy={sortBy} onSortChange={onSortChange} />
        <GenreFilter
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          allAvailableGenres={allAvailableGenres}
        />
        <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        <PlatformFilter platformFilter={platformFilter} setPlatformFilter={setPlatformFilter} />
        <DateFilter dateRangeFilter={dateRangeFilter} setDateRangeFilter={setDateRangeFilter} />
      </ScrollView>
    </VStack>
  );
};
