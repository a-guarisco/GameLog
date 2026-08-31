import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

const secureStoreMockState: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED: 'WHEN_UNLOCKED',
  AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
  ALWAYS: 'ALWAYS',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
  ALWAYS_THIS_DEVICE_ONLY: 'ALWAYS_THIS_DEVICE_ONLY',
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  setItemAsync: jest.fn((key: string, value: string) => {
    secureStoreMockState[key] = value;
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key: string) => {
    return Promise.resolve(secureStoreMockState[key] ?? null);
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete secureStoreMockState[key];
    return Promise.resolve();
  }),
}));

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

jest.mock('nativewind', () => ({
  cssInterop: jest.fn(),
  verifyTemplate: jest.fn(),
  withTV: jest.fn(),
  vars: jest.fn(() => ({})),
  useColorScheme: jest.fn(() => ({ colorScheme: 'light', setColorScheme: jest.fn() })),
}));

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

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      isFocused: jest.fn(() => true),
    })),
    useRoute: jest.fn(() => ({
      params: {},
    })),
  };
});
