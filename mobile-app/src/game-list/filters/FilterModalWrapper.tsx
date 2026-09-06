import React from 'react';
import { Modal, Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalTitle } from '@gamelog/common/CommonTypography';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';


export interface FilterModalWrapperProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const FilterModalWrapper = ({
  isVisible,
  onClose,
  title,
  children,
}: FilterModalWrapperProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={isVisible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/50 dark:bg-black/70 justify-end"
        style={{ paddingBottom: insets.bottom }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Box className="bg-background-50 rounded-t-3xl pt-6 px-6 pb-8 max-h-[100%]">
            <HStack className="justify-between items-center mb-6">
              <ModalTitle>{title}</ModalTitle>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color={HEX_COLORS.muted.icon.hex} />
              </Pressable>
            </HStack>
            {children}
          </Box>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
