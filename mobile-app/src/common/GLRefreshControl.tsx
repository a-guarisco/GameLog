import React from 'react';
import {
  RefreshControl,
  RefreshControlProps,
  useColorScheme,
} from 'react-native';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';

const primaryColor = toHex(brand.primary[500]);
const darkProgressBg = toHex(brand.bgDark[50]);
const lightProgressBg = toHex(brand.bgLight[50]);

export interface GLRefreshControlProps extends RefreshControlProps {}

export const GLRefreshControl: React.FC<GLRefreshControlProps> = ({
  tintColor = primaryColor,
  colors = [primaryColor],
  progressBackgroundColor,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const defaultProgressBg = isDark ? darkProgressBg : lightProgressBg;

  return (
    <RefreshControl
      tintColor={tintColor}
      colors={colors}
      progressBackgroundColor={progressBackgroundColor ?? defaultProgressBg}
      {...props}
    />
  );
};

export default GLRefreshControl;
