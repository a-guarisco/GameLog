import { getNavigationTheme } from '@gamelog/theme/theme';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: {
      '--color-info-500': '13 166 242',
      '--color-background-950': '255 255 255',
      '--color-background-800': '242 241 241',
      '--color-typography-0': '254 254 255',
      '--color-outline-800': '65 65 65',
      '--color-error-500': '230 53 53',
    },
    dark: {
      '--color-info-500': '50 180 244',
      '--color-background-950': '18 18 18',
      '--color-background-800': '242 241 241',
      '--color-typography-0': '23 23 23',
      '--color-outline-800': '230 230 230',
      '--color-error-500': '239 68 68',
    },
  },
}));

describe('getNavigationTheme', () => {
  const themeCases = [
    { isDarkMode: true, name: 'Dark Mode', expectedSource: rawConfig.dark },
    { isDarkMode: false, name: 'Light Mode', expectedSource: rawConfig.light },
  ];

  test.each(themeCases)(
    'should correctly map all colors and fonts for $name',
    ({ isDarkMode, expectedSource }) => {
      const theme = getNavigationTheme(isDarkMode);

      expect(theme.dark).toBe(isDarkMode);

      expect(theme.colors).toEqual({
        primary: `rgb(${expectedSource['--color-info-500']})`,
        background: `rgb(${expectedSource['--color-background-950']})`,
        card: `rgb(${expectedSource['--color-background-800']})`,
        text: `rgb(${expectedSource['--color-typography-0']})`,
        border: `rgb(${expectedSource['--color-outline-800']})`,
        notification: `rgb(${expectedSource['--color-error-500']})`,
      });

      expect(theme.fonts.bold.fontFamily).toBe('DMSans-Bold');
      expect(theme.fonts.regular.fontFamily).toBe('DMSans-Regular');
    }
  );
});
