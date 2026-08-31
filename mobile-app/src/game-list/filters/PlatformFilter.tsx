import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';
import { PlatformFilter as PlatformFilterType } from '../useGameList';

const PLATFORM_OPTIONS: PlatformFilterType[] = ['All', 'Windows', 'Mac', 'Linux', 'Deck'];

interface PlatformFilterProps {
  platformFilter: PlatformFilterType;
  setPlatformFilter: (platform: PlatformFilterType) => void;
}

export const PlatformFilter = ({ platformFilter, setPlatformFilter }: PlatformFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FilterChip
        label="Platform"
        value={platformFilter}
        onPress={() => setIsOpen(true)}
        isActive={platformFilter !== 'All'}
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Platform"
      >
        <VStack space="md">
          {PLATFORM_OPTIONS.map((plat) => (
            <Pressable
              key={plat}
              onPress={() => {
                setPlatformFilter(plat);
                setIsOpen(false);
              }}
            >
              <ModalOptionText isActive={platformFilter === plat}>{plat}</ModalOptionText>
            </Pressable>
          ))}
        </VStack>
      </FilterModalWrapper>
    </>
  );
};
