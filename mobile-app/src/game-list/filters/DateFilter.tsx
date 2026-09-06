import React, { useState } from 'react';
import { Pressable, Platform } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { DateSelectorText } from '@gamelog/common/typography/CardTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';
import { DateRange } from '../useGameList';

interface DateFilterProps {
  dateRangeFilter: DateRange;
  setDateRangeFilter: (d: DateRange) => void;
}

export const DateFilter = ({ dateRangeFilter, setDateRangeFilter }: DateFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState<Date | undefined>(dateRangeFilter.from);
  const [tempEnd, setTempEnd] = useState<Date | undefined>(dateRangeFilter.to);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const applyDateFilter = () => {
    setDateRangeFilter({ from: tempStart, to: tempEnd });
    setIsOpen(false);
  };

  const clearDateFilter = () => {
    setTempStart(undefined);
    setTempEnd(undefined);
    setDateRangeFilter({});
    setIsOpen(false);
  };

  return (
    <>
      <FilterChip
        label="Date"
        value={dateRangeFilter.from || dateRangeFilter.to ? 'Custom' : 'All'}
        onPress={() => setIsOpen(true)}
        isActive={!!(dateRangeFilter.from || dateRangeFilter.to)}
        activeBgClass={'bg-semantic-lastPlayed-100 dark:bg-semantic-lastPlayed-900/40'}
        activeBorderClass={'border-semantic-lastPlayed-600'}
        activeTextClass={'text-semantic-lastPlayed-600'}
        activeIconColor={HEX_COLORS.lastPlayed.hex}
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Date Range"
      >
        <VStack space="lg" className="pb-8">
          <HStack className="justify-between items-center px-4 mt-2">
            <VStack space="xs" className="items-center flex-1">
              <Text size="xs" className="font-medium text-typography-400">
                From
              </Text>
              <Pressable onPress={() => setShowStartPicker(true)} hitSlop={12}>
                <DateSelectorText>{tempStart ? tempStart.toLocaleDateString() : 'Select Date'}</DateSelectorText>
              </Pressable>
            </VStack>

            <VStack space="xs" className="items-center flex-1">
              <Text size="xs" className="font-medium text-typography-400">
                To
              </Text>
              <Pressable onPress={() => setShowEndPicker(true)} hitSlop={12}>
                <DateSelectorText>{tempEnd ? tempEnd.toLocaleDateString() : 'Select Date'}</DateSelectorText>
              </Pressable>
            </VStack>
          </HStack>
          
          <HStack space="md" className="mt-6">
            <Button className="flex-1" isOnCard onPress={clearDateFilter}>
              <ButtonText>Clear</ButtonText>
            </Button>
            <Button className="flex-1" isOnCard onPress={applyDateFilter}>
              <ButtonText>Apply</ButtonText>
            </Button>
          </HStack>

          {showStartPicker && (
            <DateTimePicker
              value={tempStart || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (d) setTempStart(d);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={tempEnd || new Date()}
              mode="date"
              display="default"
              onChange={(e, d) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (d) setTempEnd(d);
              }}
            />
          )}
        </VStack>
      </FilterModalWrapper>
    </>
  );
};
