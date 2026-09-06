import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
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
        activeBgClass={'bg-semantic-topPlatform-100 dark:bg-semantic-topPlatform-900/40'}
        activeBorderClass={'border-semantic-topPlatform-600'}
        activeTextClass={'text-semantic-topPlatform-600'}
        activeIconColor={HEX_COLORS.topPlatform.hex}
        testID="filter-chip-platform"
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
              testID={`filter-platform-option-${plat}`}
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
