export const lightTheme = {
  colors: {
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#ffffff',
    text: '#000000',
    card: '#f8f8f8',
    border: '#e0e0e0',
    notification: '#ff4081',
  },
  fonts: {
    main: 'DMSans-Regular',
    bold: 'DMSans-Bold',
    light: 'DMSans-Light',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

export const darkTheme = {
  colors: {
    primary: '#bb86fc',
    secondary: '#03dac6',
    background: '#121212',
    text: '#ffffff',
    card: '#1e1e1e',
    border: '#272727',
    notification: '#ff4081',
  },
  fonts: {
    main: 'DMSans-Regular',
    bold: 'DMSans-Bold',
    light: 'DMSans-Light',
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  text: {
    heading: '#ffffff',
    body: '#ffffff',
  },
};

export const getNavigationTheme = (isDarkMode: boolean) => {
  const myTheme = isDarkMode ? darkTheme : lightTheme;

  return {
    dark: isDarkMode,
    colors: {
      primary: myTheme.colors.primary,
      background: myTheme.colors.background,
      card: myTheme.colors.card,
      text: myTheme.colors.text,
      border: myTheme.colors.border,
      notification: myTheme.colors.notification,
    },
    fonts: {
      regular: {
        fontFamily: myTheme.fonts.main,
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: myTheme.fonts.main,
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: myTheme.fonts.bold,
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: myTheme.fonts.bold,
        fontWeight: '800' as const,
      },
    },
  };
};
