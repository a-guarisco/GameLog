import { Theme } from '@react-navigation/native';

const sharedFonts = {
  regular: { fontFamily: 'DMSans-Regular', fontWeight: '400' as const },
  medium: { fontFamily: 'DMSans-Medium', fontWeight: '500' as const },
  bold: { fontFamily: 'DMSans-Bold', fontWeight: '700' as const },
  heavy: { fontFamily: 'DMSans-Heavy', fontWeight: '800' as const },
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    background: '#ffffff',
    card: '#f8f8f8',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#ff4081',
  },
  fonts: sharedFonts,
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#bb86fc',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#272727',
    notification: '#ff4081',
  },
  fonts: sharedFonts,
};

export const getNavigationTheme = (isDarkMode: boolean): Theme =>
  isDarkMode ? darkTheme : lightTheme;
