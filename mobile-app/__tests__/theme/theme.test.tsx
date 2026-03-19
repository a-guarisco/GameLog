import { getNavigationTheme } from '@gamelog/theme/theme';
import { config } from '@gamelog/components/ui/gluestack-ui-provider/config';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  config: {
    light: {
      '--color-primary-500': '51 51 51',
      '--color-background-950': '255 255 255',
      '--color-background-900': '242 241 241',
      '--color-typography-900': '38 38 39',
      '--color-outline-200': '221 220 219',
      '--color-error-500': '230 53 53',
    },
    dark: {
      '--color-primary-500': '230 230 230',
      '--color-background-950': '18 18 18',
      '--color-background-900': '246 246 246',
      '--color-typography-900': '245 245 245',
      '--color-outline-200': '243 243 243',
      '--color-error-500': '239 68 68',
    },
  },
}));

describe('Navigation Theme Selection Logic', () => {
  describe('Dark Mode', () => {
    const navTheme = getNavigationTheme(true);

    it('sets the dark property to true', () => {
      expect(navTheme.dark).toBe(true);
    });

    it('correctly transforms Gluestack vars to RGB for Navigation', () => {
      const expectedPrimary = `rgb(${config.dark['--color-primary-500']})`;
      const expectedBackground = `rgb(${config.dark['--color-background-950']})`;

      expect(navTheme.colors.primary).toBe(expectedPrimary);
      expect(navTheme.colors.background).toBe(expectedBackground);
    });

    it('verifies typography remains consistent', () => {
      expect(navTheme.fonts.bold.fontFamily).toBe('DMSans-Bold');
    });
  });

  describe('Light Mode', () => {
    const navTheme = getNavigationTheme(false);

    it('sets the dark property to false', () => {
      expect(navTheme.dark).toBe(false);
    });

    it('maps light tokens from config correctly', () => {
      const expectedText = `rgb(${config.light['--color-typography-900']})`;
      expect(navTheme.colors.text).toBe(expectedText);
    });
  });

  describe('Theme Integrity', () => {
    it('returns different background colors for light and dark', () => {
      const lightNav = getNavigationTheme(false);
      const darkNav = getNavigationTheme(true);

      expect(lightNav.colors.background).not.toContain('undefined');
      expect(darkNav.colors.background).not.toContain('undefined');
      expect(lightNav.colors.background).not.toBe(darkNav.colors.background);
    });
  });
});
