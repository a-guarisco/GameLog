import React from 'react';
import { Pressable, useColorScheme } from 'react-native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrientation } from '@gamelog/common/useOrientation';
import { getNavRailOffset } from '@gamelog/common/navConstants';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import Ionicons from '@react-native-vector-icons/ionicons';

export const DevHeader: React.FC<NativeStackHeaderProps> = ({
  navigation,
  options,
  route,
  back,
}) => {
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const railOffset = getNavRailOffset({ isLandscape, isTablet, insetsLeft: insets.left });

  const title =
    typeof options.title === 'string'
      ? options.title
      : typeof options.headerTitle === 'string'
        ? options.headerTitle
        : route.name;

  return (
    <Box
      className="bg-background-50 border-b border-outline-100"
      style={{
        paddingTop: insets.top,
        paddingLeft: railOffset,
      }}
    >
      <HStack className="h-14 items-center px-4" space="sm">
        {back ? (
          <Pressable
            onPress={navigation.goBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            testID="dev-header-back-btn"
            className="w-10 h-10 -ml-2 items-center justify-center rounded-xl active:opacity-70"
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#F5F5F5' : '#171717'} />
          </Pressable>
        ) : null}
        <Text className="text-lg font-bold text-typography-0 flex-1" numberOfLines={1}>
          {title}
        </Text>
      </HStack>
    </Box>
  );
};
