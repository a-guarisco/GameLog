import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { ModalOptionText } from '@gamelog/common/CommonTypography';
import Chip from '@gamelog/common/Chip';
import Ionicons from '@react-native-vector-icons/ionicons';
import { FilterModalWrapper } from '@gamelog/game-list/filters/FilterModalWrapper';
import { GameStatus, GAME_STATUS_LABELS } from '@gamelog/api-manager/dto';
import { useGetGameStatus, useUpdateGameStatus } from '@gamelog/api-manager/useApi';

export interface GameStatusSelectorChipProps {
  appId: string;
  initialStatus?: GameStatus | null;
  onStatusChange?: (newStatus: GameStatus) => void;
}

const STATUS_OPTIONS: { key: GameStatus; label: string }[] = [
  { key: 'playing', label: GAME_STATUS_LABELS.playing },
  { key: 'to_be_played', label: GAME_STATUS_LABELS.to_be_played },
  { key: 'shelved', label: GAME_STATUS_LABELS.shelved },
  { key: 'platinato', label: GAME_STATUS_LABELS.platinato },
];

export const GameStatusSelectorChip = ({
  appId,
  initialStatus,
  onStatusChange,
}: GameStatusSelectorChipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | null>(initialStatus ?? null);
  const [updatingKey, setUpdatingKey] = useState<GameStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { gameStatus, isLoadingGameStatus, refetchGameStatus } = useGetGameStatus(appId);
  const { updateGameStatus } = useUpdateGameStatus();

  useEffect(() => {
    if (initialStatus !== undefined) {
      setSelectedStatus(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (initialStatus === undefined && gameStatus) {
      setSelectedStatus(gameStatus);
    }
  }, [gameStatus, initialStatus]);

  const handleSelectStatus = async (status: GameStatus) => {
    if (status === selectedStatus && !errorMessage) {
      setIsOpen(false);
      return;
    }

    setUpdatingKey(status);
    setErrorMessage(null);

    try {
      await updateGameStatus(appId, status);
      setSelectedStatus(status);
      onStatusChange?.(status);
      refetchGameStatus();
      setIsOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update status. Please try again.');
    } finally {
      setUpdatingKey(null);
    }
  };

  const getDisplayLabel = () => {
    if (selectedStatus) {
      return GAME_STATUS_LABELS[selectedStatus] || selectedStatus;
    }
    if (isLoadingGameStatus) {
      return '...';
    }
    return 'No Status';
  };

  const getStatusClasses = (status: GameStatus | null) => {
    if (!status)
      return { bg: 'bg-background-200', border: 'border-outline-100', text: 'text-typography-100' };
    switch (status) {
      case 'playing':
        return {
          bg: 'bg-gameStatus-playing-100 dark:bg-gameStatus-playing-900/40',
          border: 'border-gameStatus-playing-600',
          text: 'text-gameStatus-playing-600',
        };
      case 'to_be_played':
        return {
          bg: 'bg-gameStatus-toBePlayed-100 dark:bg-gameStatus-toBePlayed-900/40',
          border: 'border-gameStatus-toBePlayed-600',
          text: 'text-gameStatus-toBePlayed-600',
        };
      case 'shelved':
        return {
          bg: 'bg-gameStatus-shelved-100 dark:bg-gameStatus-shelved-900/40',
          border: 'border-gameStatus-shelved-600',
          text: 'text-gameStatus-shelved-600',
        };
      case 'platinato':
        return {
          bg: 'bg-gameStatus-platinato-100 dark:bg-gameStatus-platinato-900/40',
          border: 'border-gameStatus-platinato-600',
          text: 'text-gameStatus-platinato-600',
        };
      default:
        return {
          bg: 'bg-background-200',
          border: 'border-outline-100',
          text: 'text-typography-100',
        };
    }
  };
  const statusClasses = getStatusClasses(selectedStatus);

  return (
    <>
      <Pressable
        onPress={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
      >
        <Chip className={`${statusClasses.bg} ${statusClasses.border}`}>
          <Text size="xs" className={`font-bold ${statusClasses.text}`}>
            {getDisplayLabel()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={12}
            color={
              selectedStatus ? HEX_COLORS.gameStatus[selectedStatus].hex : HEX_COLORS.muted.icon.hex
            }
          />
        </Chip>
      </Pressable>

      <FilterModalWrapper
        isVisible={isOpen}
        onClose={() => {
          if (!updatingKey) {
            setIsOpen(false);
            setErrorMessage(null);
          }
        }}
        title="Change Game Status"
      >
        <ScrollView>
          <VStack space="sm">
            {errorMessage && (
              <Text size="xs" className="text-red-500 mb-2">
                {errorMessage}
              </Text>
            )}

            {STATUS_OPTIONS.map((option) => {
              const isCurrent = selectedStatus === option.key;
              const isThisUpdating = updatingKey === option.key;

              return (
                <Pressable
                  key={option.key}
                  disabled={updatingKey !== null}
                  onPress={() => handleSelectStatus(option.key)}
                >
                  <HStack className="justify-between items-center py-2">
                    <ModalOptionText isActive={isCurrent}>{option.label}</ModalOptionText>
                    {isThisUpdating && (
                      <ActivityIndicator
                        size="small"
                        color={HEX_COLORS.gameStatus[option.key].hex}
                      />
                    )}
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        </ScrollView>
      </FilterModalWrapper>
    </>
  );
};

export default GameStatusSelectorChip;
