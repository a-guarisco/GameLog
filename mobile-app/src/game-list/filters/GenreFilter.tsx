import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';

interface GenreFilterProps {
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
  allAvailableGenres: string[];
}

export const GenreFilter = ({
  genreFilter,
  setGenreFilter,
  allAvailableGenres,
}: GenreFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FilterChip
        label="Genre"
        value={genreFilter === 'All' ? 'All' : genreFilter}
        onPress={() => setIsOpen(true)}
        isActive={genreFilter !== 'All'}
        activeBgClass={'bg-semantic-genre-100 dark:bg-semantic-genre-900/40'}
        activeBorderClass={'border-semantic-genre-600'}
        activeTextClass={'text-semantic-genre-600'}
        activeIconColor={HEX_COLORS.genre.hex}
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Genre"
      >
        <ScrollView>
          <VStack space="sm">
            <Pressable
              testID="filter-genre-option-All"
              onPress={() => {
                setGenreFilter('All');
                setIsOpen(false);
              }}
            >
              <ModalOptionText isActive={genreFilter === 'All'}>All Genres</ModalOptionText>
            </Pressable>
            {allAvailableGenres.map((genre) => (
              <Pressable
                key={genre}
                testID={`filter-genre-option-${genre}`}
                onPress={() => {
                  setGenreFilter(genre);
                  setIsOpen(false);
                }}
              >
                <ModalOptionText isActive={genreFilter === genre}>{genre}</ModalOptionText>
              </Pressable>
            ))}
          </VStack>
        </ScrollView>
      </FilterModalWrapper>
    </>
  );
};
