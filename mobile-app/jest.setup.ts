jest.mock('@expo-google-fonts/dm-sans', () => ({
  useFonts: jest.fn(() => [true]),
  DMSans_100Thin: 'DMSans_100Thin',
  DMSans_200ExtraLight: 'DMSans_200ExtraLight',
  DMSans_300Light: 'DMSans_300Light',
  DMSans_400Regular: 'DMSans_400Regular',
  DMSans_500Medium: 'DMSans_500Medium',
  DMSans_700Bold: 'DMSans_700Bold',
  DMSans_800ExtraBold: 'DMSans_800ExtraBold',
  DMSans_900Black: 'DMSans_900Black',
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));
