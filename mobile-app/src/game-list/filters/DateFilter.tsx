import React, { useState } from 'react';
import { Pressable, Platform } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import DateTimePicker from '@react-native-community/datetimepicker';
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
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Date Range"
      >
        <VStack space="lg" className="pb-8">
          <HStack space="md" className="items-center">
            <Text className="w-16 font-medium">From:</Text>
            <Pressable
              className="flex-1 border border-outline-300 p-3 rounded-md"
              onPress={() => setShowStartPicker(true)}
            >
              <Text>{tempStart ? tempStart.toLocaleDateString() : 'Select Start Date'}</Text>
            </Pressable>
          </HStack>
          <HStack space="md" className="items-center">
            <Text className="w-16 font-medium">To:</Text>
            <Pressable
              className="flex-1 border border-outline-300 p-3 rounded-md"
              onPress={() => setShowEndPicker(true)}
            >
              <Text>{tempEnd ? tempEnd.toLocaleDateString() : 'Select End Date'}</Text>
            </Pressable>
          </HStack>
          <HStack space="md" className="mt-4">
            <Button variant="outline" className="flex-1" onPress={clearDateFilter}>
              <ButtonText>Clear</ButtonText>
            </Button>
            <Button className="flex-1" onPress={applyDateFilter}>
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
