import { getNavigationTheme } from '@gamelog/theme/themeHelpers';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: {
      '--color-primary-500': '13 166 242',
      '--color-background-0': '255 255 255',
      '--color-background-50': '242 241 241',
      '--color-typography-800': '25 25 25',
      '--color-outline-50': '230 230 230',
      '--color-error-500': '230 53 53',
      '--color-info-500': '13 166 242',
    },
    dark: {
      '--color-primary-500': '50 180 244',
      '--color-background-0': '18 18 18',
      '--color-background-50': '30 30 30',
      '--color-typography-800': '255 255 255',
      '--color-outline-100': '45 45 45',
      '--color-error-500': '239 68 68',
      '--color-info-500': '50 180 244',
    },
  },
}));

describe('getNavigationTheme', () => {
  test('should correctly map colors for Dark Mode', () => {
    const theme = getNavigationTheme(true);
    const src = rawConfig.dark;

    expect(theme.colors).toEqual({
      primary: `rgb(${src['--color-primary-500']})`,
      background: `rgb(${src['--color-background-0']})`,
      card: `rgb(${src['--color-background-50']})`,
      text: `rgb(${src['--color-typography-0']})`,
      border: `rgb(${src['--color-outline-100']})`,
      notification: `rgb(${src['--color-info-500']})`,
    });
  });

  test('should correctly map colors for Light Mode', () => {
    const theme = getNavigationTheme(false);
    const src = rawConfig.light;

    expect(theme.colors).toEqual({
      primary: `rgb(${src['--color-primary-500']})`,
      background: `rgb(${src['--color-background-50']})`,
      card: `rgb(${src['--color-background-0']})`,
      text: `rgb(${src['--color-typography-0']})`,
      border: `rgb(${src['--color-outline-50']})`,
      notification: `rgb(${src['--color-info-500']})`,
    });
  });
});
