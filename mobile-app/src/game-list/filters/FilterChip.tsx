import React from 'react';
import { Pressable } from 'react-native';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import Ionicons from '@react-native-vector-icons/ionicons';
import { HEX_COLORS } from '@gamelog/theme/hexColors';

export interface FilterChipProps {
  label: string;
  value: string | undefined;
  onPress: () => void;
  isActive: boolean;
  activeBgClass?: string;
  activeBorderClass?: string;
  activeTextClass?: string;
  activeIconColor?: string;
  testID?: string;
}

export const FilterChip = ({
  label,
  value,
  onPress,
  isActive,
  activeBgClass = 'bg-primary-500',
  activeBorderClass = 'border-primary-500',
  activeTextClass = 'text-typography-0',
  activeIconColor = HEX_COLORS.overlay.icon.hex,
}: FilterChipProps) => (
  <Pressable onPress={onPress} testID={testID}>
    <HStack
      space="xs"
      className={`items-center px-3 py-1.5 rounded-full border ${isActive ? `${activeBgClass} ${activeBorderClass}` : 'bg-background-50 border-outline-300'}`}
    >
      <Text size="sm" className={isActive ? `${activeTextClass} font-bold` : 'text-typography-200'}>
        {label}:{' '}
        <Text
          size="sm"
          className={isActive ? `${activeTextClass} font-bold` : 'text-typography-100 font-medium'}
        >
          {value}
        </Text>
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={isActive ? activeIconColor : HEX_COLORS.muted.icon.hex}
      />
    </HStack>
  </Pressable>
);
