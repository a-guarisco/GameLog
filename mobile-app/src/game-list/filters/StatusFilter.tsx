import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import { FilterChip } from './FilterChip';
import { FilterModalWrapper } from './FilterModalWrapper';
import { GameStatus, GAME_STATUS_LABELS } from '@gamelog/api-manager/dto';
import { StatusFilter as StatusFilterType } from '../useGameList';

interface StatusFilterProps {
  statusFilter: StatusFilterType;
  setStatusFilter: (status: StatusFilterType) => void;
}

const STATUS_OPTIONS: { key: StatusFilterType; label: string }[] = [
  { key: 'All', label: 'All Statuses' },
  { key: 'playing', label: GAME_STATUS_LABELS.playing },
  { key: 'to_be_played', label: GAME_STATUS_LABELS.to_be_played },
  { key: 'shelved', label: GAME_STATUS_LABELS.shelved },
  { key: 'platinato', label: GAME_STATUS_LABELS.platinato },
  { key: 'none', label: 'No Status' },
];

export const StatusFilter = ({ statusFilter, setStatusFilter }: StatusFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getChipValue = () => {
    if (statusFilter === 'All') return 'All';
    if (statusFilter === 'none') return 'No Status';
    return GAME_STATUS_LABELS[statusFilter as GameStatus] || statusFilter;
  };

  const getActiveColors = () => {
    if (statusFilter !== 'All' && statusFilter !== 'none') {
      const statusKey = statusFilter as GameStatus;
      switch (statusKey) {
        case 'playing':
          return {
            activeBgClass: 'bg-gameStatus-playing-100 dark:bg-gameStatus-playing-900/40',
            activeBorderClass: 'border-gameStatus-playing-600',
            activeTextClass: 'text-gameStatus-playing-600',
            activeIconColor: HEX_COLORS.gameStatus[statusKey]?.hex || HEX_COLORS.muted.icon.hex,
          };
        case 'to_be_played':
          return {
            activeBgClass: 'bg-gameStatus-toBePlayed-100 dark:bg-gameStatus-toBePlayed-900/40',
            activeBorderClass: 'border-gameStatus-toBePlayed-600',
            activeTextClass: 'text-gameStatus-toBePlayed-600',
            activeIconColor: HEX_COLORS.gameStatus[statusKey]?.hex || HEX_COLORS.muted.icon.hex,
          };
        case 'shelved':
          return {
            activeBgClass: 'bg-gameStatus-shelved-100 dark:bg-gameStatus-shelved-900/40',
            activeBorderClass: 'border-gameStatus-shelved-600',
            activeTextClass: 'text-gameStatus-shelved-600',
            activeIconColor: HEX_COLORS.gameStatus[statusKey]?.hex || HEX_COLORS.muted.icon.hex,
          };
        case 'platinato':
          return {
            activeBgClass: 'bg-gameStatus-platinato-100 dark:bg-gameStatus-platinato-900/40',
            activeBorderClass: 'border-gameStatus-platinato-600',
            activeTextClass: 'text-gameStatus-platinato-600',
            activeIconColor: HEX_COLORS.gameStatus[statusKey]?.hex || HEX_COLORS.muted.icon.hex,
          };
      }
    }
    return {
      activeBgClass: 'bg-primary-100 dark:bg-primary-900/40',
      activeBorderClass: 'border-primary-600',
      activeTextClass: 'text-primary-600',
      activeIconColor: HEX_COLORS.comparison.user.hex,
    };
  };

  const activeColors = getActiveColors();

  return (
    <>
      <FilterChip
        label="Status"
        value={getChipValue()}
        onPress={() => setIsOpen(true)}
        isActive={statusFilter !== 'All'}
        {...activeColors}
      />

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter by Status"
      >
        <ScrollView>
          <VStack space="sm">
            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  setStatusFilter(option.key);
                  setIsOpen(false);
                }}
              >
                <ModalOptionText isActive={statusFilter === option.key}>
                  {option.label}
                </ModalOptionText>
              </Pressable>
            ))}
          </VStack>
        </ScrollView>
      </FilterModalWrapper>
    </>
  );
};
