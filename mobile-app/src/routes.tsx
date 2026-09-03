import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import GameListView from '@gamelog/game-list/GameListView';
import ProfileView from '@gamelog/profile/ProfileView';
import GameView from '@gamelog/game/GameView';
import AchievementsListView from '@gamelog/game/AchievementsListView';
import SocialView from '@gamelog/social/social-view/SocialView';
import FriendRecommendationsView from '@gamelog/social/social-view/FriendRecommendationsView';
import OtherUserProfileView from '@gamelog/social/other-user-profile/OtherUserProfileView';
import {
  DevView,
  DevEnvView,
  DevAestheticsView,
  DevBackendView,
  DevAuthView,
  PaletteView,
  FontsView,
} from '@gamelog/dev';

import LoginScreen from '@gamelog/onboarding/LoginScreen';
import ProfileSetupScreen from '@gamelog/onboarding/ProfileSetupScreen';
import UnverifiedScreen from '@gamelog/onboarding/UnverifiedScreen';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AdaptiveTabBar } from '@gamelog/common/AdaptiveTabBar';

export const GameListStack = createNativeStackNavigator({
  screens: {
    HomePage: {
      screen: GameListView,
      options: {
        header: () => <SafeAreaView edges={['top']} className="bg-background-0" />,
      },
    },
    Game: {
      screen: GameView,
      options: { headerShown: false },
    },
    AchievementsList: {
      screen: AchievementsListView,
      options: { headerShown: false },
    },
  },
});

export const SocialStack = createNativeStackNavigator({
  screens: {
    SocialHome: {
      screen: SocialView,
      options: { headerShown: false },
    },
    FriendRecommendations: {
      screen: FriendRecommendationsView,
      options: { headerShown: false },
    },
    OtherUserProfile: {
      screen: OtherUserProfileView,
      options: { headerShown: false },
    },
  },
});

export const DevStack = createNativeStackNavigator({
  screens: {
    TestingMain: {
      screen: DevView,
      options: { headerShown: false },
    },
    DevEnv: {
      screen: DevEnvView,
      options: { title: 'Environment Variables', headerShown: true },
    },
    DevAesthetics: {
      screen: DevAestheticsView,
      options: { title: 'Aesthetics & Theme', headerShown: true },
    },
    DevBackend: {
      screen: DevBackendView,
      options: { title: 'Backend & Endpoints', headerShown: true },
    },
    DevAuth: {
      screen: DevAuthView,
      options: { title: 'Authentication', headerShown: true },
    },
    DevPalette: {
      screen: PaletteView,
      options: { title: 'Color Palette', headerShown: true },
    },
    DevFonts: {
      screen: FontsView,
      options: { title: 'Fonts & Typography', headerShown: true },
    },
  },
});

export const RootTabs = createBottomTabNavigator({
  tabBar: (props) => <AdaptiveTabBar {...props} />,
  screens: {
    GameListTab: {
      screen: GameListStack,
      options: {
        headerShown: false,
        title: 'Games',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'game-controller' : 'game-controller-outline'}
            size={size}
            color={color}
          />
        ),
      },
    },
    ProfileTab: {
      screen: ProfileView,
      options: {
        title: 'Profile',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
        headerShown: false,
      },
    },
    SocialTab: {
      screen: SocialStack,
      options: {
        title: 'Social',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
        ),
        headerShown: false,
      },
    },
    DevTab: {
      screen: DevStack,
      options: {
        title: 'Dev',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'construct' : 'construct-outline'} size={size} color={color} />
        ),
      },
    },
  },
});

export const AuthNavigator = createNativeStackNavigator({
  screens: {
    Login: {
      screen: LoginScreen,
      options: { headerShown: false },
    },
  },
});

export const UnverifiedNavigator = createNativeStackNavigator({
  screens: {
    Unverified: {
      screen: UnverifiedScreen,
      options: { headerShown: false },
    },
  },
});

export const OnboardingNavigator = createNativeStackNavigator({
  screens: {
    ProfileSetup: {
      screen: ProfileSetupScreen,
      options: { headerShown: false },
    },
  },
});
