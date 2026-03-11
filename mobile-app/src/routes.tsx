import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameListView from './game-list/GameListView';
import ProfileView from './profile/ProfileView';
import GameView from './game/GameView';
import Ionicons from '@react-native-vector-icons/ionicons';

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
  },
});
