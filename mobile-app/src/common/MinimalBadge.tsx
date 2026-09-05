import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { HEX_COLORS } from '@gamelog/theme/hexColors';
import Ionicons from '@react-native-vector-icons/ionicons';

export const MinimalBadge = ({
  iconName,
  text,
  colorHex = HEX_COLORS.muted.icon.hex,
  borderColorClass = 'border-outline-300',
  textColorClass = 'text-typography-200',
  bgClass = 'bg-transparent',
  hideText = false,
  testID,
}: {
  iconName: string;
  text: string;
  colorHex?: string;
  borderColorClass?: string;
  textColorClass?: string;
  bgClass?: string;
  hideText?: boolean;
  testID?: string;
}) => (
  <HStack
    style={{ height: 22, minWidth: hideText ? 32 : undefined }}
    className={`items-center justify-center px-1.5 gap-0.5 rounded-full border ${borderColorClass} ${bgClass}`}
    testID={testID}
  >
    <Ionicons name={iconName} size={12} color={colorHex} />
    {!hideText && (
      <Text style={{ fontSize: 10 }} className={`font-bold ${textColorClass}`} numberOfLines={1}>
        {text}
      </Text>
    )}
  </HStack>
);
