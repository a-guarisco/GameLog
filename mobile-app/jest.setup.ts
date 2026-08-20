import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

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

jest.mock('expo-blur', () => {
  const { View } = jest.requireActual('react-native');

  return {
    BlurView: View,
    BlurTargetView: View,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');

  return {
    LinearGradient: View,
  };
});

jest.mock('react-native-gifted-charts', () => {
  return {
    BarChart: 'BarChart',
  };
});

jest.mock('@react-native-masked-view/masked-view', () => {
  const { View } = jest.requireActual('react-native');
  return View;
});

jest.mock('react-native-safe-area-context', () => {
  const mockSafeAreaContext = jest.requireActual('react-native-safe-area-context/jest/mock');
  return mockSafeAreaContext.default ?? mockSafeAreaContext;
});

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
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn(() => Promise.resolve()),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

if (!process.env.EXPO_PUBLIC_STEAM_API_KEY) {
  process.env.EXPO_PUBLIC_STEAM_API_KEY = 'test-steam-api-key';
}

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({
        data: {
          idToken: 'mock-google-id-token',
        },
      })
    ),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(false)),
  },
}));
