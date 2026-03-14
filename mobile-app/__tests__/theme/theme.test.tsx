import { lightTheme, darkTheme, getNavigationTheme } from '../../src/theme/theme';

describe('Theme Selection Logic', () => {
  describe('Dark Mode', () => {
    const navTheme = getNavigationTheme(true);

    it('sets the dark property to true', () => {
      expect(navTheme.dark).toBe(true);
    });

    it('maps colors from darkTheme correctly', () => {
      expect(navTheme.colors).toMatchObject({
        primary: darkTheme.colors.primary,
        background: darkTheme.colors.background,
        card: darkTheme.colors.card,
        text: darkTheme.colors.text,
        border: darkTheme.colors.border,
        notification: darkTheme.colors.notification,
      });
    });

    it('maps fonts from darkTheme correctly', () => {
      expect(navTheme.fonts).toEqual(darkTheme.fonts);
    });
  });

  describe('Light Mode', () => {
    const navTheme = getNavigationTheme(false);

    it('sets the dark property to false', () => {
      expect(navTheme.dark).toBe(false);
    });

    it('maps colors from lightTheme correctly', () => {
      expect(navTheme.colors).toMatchObject({
        primary: lightTheme.colors.primary,
        background: lightTheme.colors.background,
        card: lightTheme.colors.card,
        text: lightTheme.colors.text,
        border: lightTheme.colors.border,
        notification: lightTheme.colors.notification,
      });
    });

    it('maps fonts from lightTheme correctly', () => {
      expect(navTheme.fonts).toEqual(lightTheme.fonts);
    });
  });
});
