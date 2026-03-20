import { Theme } from '@react-navigation/native';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';

const toRGB = (colorVar: string) => `rgb(${colorVar})`;

const sharedFonts = {
  regular: { fontFamily: 'DMSans-Regular', fontWeight: '400' as const },
  medium: { fontFamily: 'DMSans-Medium', fontWeight: '500' as const },
  bold: { fontFamily: 'DMSans-Bold', fontWeight: '700' as const },
  heavy: { fontFamily: 'DMSans-Heavy', fontWeight: '800' as const },
};

export const getNavigationTheme = (isDarkMode: boolean): Theme => {
  const themeVars = isDarkMode ? rawConfig.dark : rawConfig.light;

  return {
    dark: isDarkMode,
    colors: {
      primary: `rgb(${themeVars['--color-info-500']})`,
      background: `rgb(${themeVars['--color-background-950']})`,
      card: `rgb(${themeVars['--color-background-800']})`,
      text: `rgb(${themeVars['--color-typography-0']})`,
      border: `rgb(${themeVars['--color-outline-800']})`,
      notification: `rgb(${themeVars['--color-error-500']})`,
    },
    fonts: sharedFonts,
  };
};
