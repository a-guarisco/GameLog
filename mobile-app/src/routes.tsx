import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import GameListView from '@gamelog/game-list/GameListView';
import ProfileView from '@gamelog/profile/ProfileView';
import GameView from '@gamelog/game/GameView';
import AchievementsListView from '@gamelog/game/AchievementsListView';
import {
  DevView,
  DevEnvView,
  DevAestheticsView,
  DevBackendView,
  DevAuthView,
  PaletteView,
  FontsView,
} from '@gamelog/dev';
import GameBanner from '@gamelog/game/GameBanner';

const renderGameBannerHeader = (route: any) => {
  const gameItem = route?.params?.gameItem;
  const appId = gameItem.appid;

  if (!appId) {
    console.log('No game data found in route params:', route?.params);
    return null;
  }

  return (
    <GameBanner appid={appId} title={gameItem?.name ?? 'Game'} streak={gameItem?.streak ?? 2} />
  );
};

export const GameListStack = createNativeStackNavigator({
  screens: {
    HomePage: {
      screen: GameListView,
      options: {
        title: 'Game List',
        headerShown: true,
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

export const TestingStack = createNativeStackNavigator({
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
  screens: {
    GameList: {
      screen: GameListStack,
      options: {
        headerShown: false,
        title: 'Game List',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? 'game-controller' : 'game-controller-outline'}
            size={size}
            color={color}
          />
        ),
      },
    },
    Profile: {
      screen: ProfileView,
      options: {
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
        headerShown: false,
      },
    },
    ComponentLibrary: {
      screen: TestingStack,
      options: {
        title: 'Dev',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'construct' : 'construct-outline'} size={size} color={color} />
        ),
      },
    },
  },
});
