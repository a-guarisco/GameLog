import { Theme } from '@react-navigation/native';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';
import { navigationFonts } from './theme';

export const getNavigationTheme = (isDarkMode: boolean): Theme => {
  const themeVars = isDarkMode ? rawConfig.dark : rawConfig.light;

  return {
    dark: isDarkMode,
    colors: {
      primary: `rgb(${themeVars['--color-primary-500']})`,

      background: isDarkMode
        ? `rgb(${themeVars['--color-background-0']})`
        : `rgb(${themeVars['--color-background-50']})`,

      card: isDarkMode
        ? `rgb(${themeVars['--color-background-50']})`
        : `rgb(${themeVars['--color-background-0']})`,

      text: `rgb(${themeVars['--color-typography-0']})`,

      border: isDarkMode
        ? `rgb(${themeVars['--color-outline-100']})`
        : `rgb(${themeVars['--color-outline-50']})`,

      notification: `rgb(${themeVars['--color-info-500']})`,
    },
    fonts: navigationFonts,
  };
};
