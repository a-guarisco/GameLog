import '@testing-library/react-native';
// Importa questo per silenziare il warning prima che Tamagui inizializzi i menu nativi
import '@tamagui/native/setup-zeego';

jest.mock('@expo-google-fonts/dm-sans', () => ({
  useFonts: jest.fn(() => [true]),
  DMSans_400Regular: 'DMSans_400Regular',
  DMSans_700Bold: 'DMSans_700Bold',
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@tamagui/native', () => ({
  ...jest.requireActual('@tamagui/native'),
  setupZeego: jest.fn(),
}));

// Mock per Tamagui: simula le funzioni del browser
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };
