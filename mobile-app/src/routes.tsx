import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import GameListView from '@gamelog/game-list/GameListView';
import ProfileView from '@gamelog/profile/ProfileView';
import GameView from '@gamelog/game/GameView';
import { ThemeView, DevPaletteView } from '@gamelog/theme';

export const GameListStack = createNativeStackNavigator({
  screens: {
    HomePage: {
      screen: GameListView,
      options: { headerShown: false },
    },
    Game: {
      screen: GameView,
      options: { headerShown: false },
    },
  },
});

export const TestingStack = createNativeStackNavigator({
  screens: {
    TestingMain: {
      screen: ThemeView,
      options: { headerShown: false },
    },
    DevPalette: {
      screen: DevPaletteView,
      options: { headerShown: false },
    },
  },
});

export const RootTabs = createBottomTabNavigator({
  screens: {
    GameList: {
      screen: GameListStack,
      options: {
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
