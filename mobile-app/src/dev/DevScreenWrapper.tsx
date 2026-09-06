import React from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavRailOffset } from '@gamelog/common/navConstants';

export interface DevScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  testID?: string;
}

export const DevScreenWrapper: React.FC<DevScreenWrapperProps> = ({
  children,
  className = '',
  testID,
}) => {
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const leftPadding = getNavRailOffset({ isLandscape, isTablet, insetsLeft: insets.left });

  return (
    <Box
      className={`flex-1 bg-background-0 ${className}`}
      style={{ paddingLeft: leftPadding }}
      testID={testID}
    >
      {children}
    </Box>
  );
};
