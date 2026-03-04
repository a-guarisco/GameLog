import '@testing-library/react-native';

jest.mock('@expo-google-fonts/dm-sans', () => ({
  useFonts: () => [true], // Simulate fonts being loaded
  DMSans_400Regular: 'DMSans_400Regular',
  DMSans_700Bold: 'DMSans_700Bold',
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));
