import React, { useState } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { METRICS } from '@gamelog/theme/metrics';
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

  return (
    <>
      <FilterChip
        label="Status"
        value={getChipValue()}
        onPress={() => setIsOpen(true)}
        isActive={statusFilter !== 'All'}
        activeBgClass={METRICS.status.bgClass}
        activeBorderClass={METRICS.status.borderClass}
        activeTextClass={METRICS.status.textClass}
        activeIconColor={METRICS.status.hex}
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
