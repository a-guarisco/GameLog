import React from 'react';
import { Modal, Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { ModalTitle } from './CommonTypography';
import Ionicons from '@react-native-vector-icons/ionicons';

export interface ActionConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'destructive' | 'primary';
  testIDPrefix?: string;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  testIDPrefix = 'action',
}) => {
  const isDestructive = confirmVariant === 'destructive';

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
      testID={`${testIDPrefix}-confirm-modal`}
    >
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-sm"
          onPress={(e) => e.stopPropagation()}
        >
          <Box className="bg-background-50 border border-outline-100 rounded-2xl p-5 shadow-2xl">
            <HStack className="justify-between items-center mb-3">
              <HStack space="sm" className="items-center flex-1 pr-2">
                {isDestructive ? (
                  <Ionicons name="warning-outline" size={20} color="#f87171" />
                ) : (
                  <Ionicons name="information-circle-outline" size={20} color="#60a5fa" />
                )}
                <ModalTitle className="text-lg font-bold text-typography-0">
                  {title}
                </ModalTitle>
              </HStack>
              <Pressable onPress={onClose} hitSlop={8} testID={`${testIDPrefix}-cancel-x-btn`}>
                <Ionicons name="close" size={20} color="#a3a3a3" />
              </Pressable>
            </HStack>

            <Text size="sm" className="text-typography-300 mb-6 leading-5">
              {message}
            </Text>

            <HStack space="sm" className="justify-end items-center">
              <Pressable
                onPress={onClose}
                testID={`${testIDPrefix}-cancel-btn`}
                hitSlop={4}
                className="px-4 py-2 rounded-lg border border-outline-200 bg-transparent active:opacity-70"
              >
                <Text size="sm" className="font-semibold text-typography-200">
                  {cancelLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  onClose();
                  onConfirm();
                }}
                testID={`${testIDPrefix}-confirm-btn`}
                hitSlop={4}
                className={`px-4 py-2 rounded-lg items-center justify-center active:opacity-80 ${
                  isDestructive
                    ? 'bg-red-500/20 border border-red-500/50'
                    : 'bg-primary-500/20 border border-primary-500/50'
                }`}
              >
                <Text
                  size="sm"
                  className={`font-semibold ${
                    isDestructive ? 'text-red-400' : 'text-primary-400'
                  }`}
                >
                  {confirmLabel}
                </Text>
              </Pressable>
            </HStack>
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ActionConfirmModal;
