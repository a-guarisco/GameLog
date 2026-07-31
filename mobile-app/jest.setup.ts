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

jest.mock('@gamelog/auth/firebaseClient', () => ({
  app: {},
  auth: {
    currentUser: null,
  },
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  signInWithEmailAndPassword: jest.fn(),
}));

if (!process.env.EXPO_PUBLIC_STEAM_API_KEY) {
  process.env.EXPO_PUBLIC_STEAM_API_KEY = 'test-steam-api-key';
}
