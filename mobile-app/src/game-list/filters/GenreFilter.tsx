import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { METRICS } from '@gamelog/theme/metrics';
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
        activeBgClass={METRICS.genre.bgClass}
        activeBorderClass={METRICS.genre.borderClass}
        activeTextClass={METRICS.genre.textClass}
        activeIconColor={METRICS.genre.hex}
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Genre"
      >
        <ScrollView>
          <VStack space="sm">
            <Pressable
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
