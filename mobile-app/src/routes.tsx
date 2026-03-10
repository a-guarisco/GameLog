import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GameList from './game-list/GameList';
import Profile from './profile/Profile';
import Game from './game/Game';
import Ionicons from '@react-native-vector-icons/ionicons';

export const GameListStack = createNativeStackNavigator({
  screens: {
    HomePage: {
      screen: GameList,
      options: { headerShown: false },
    },
    Game: {
      screen: Game,
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
      screen: Profile,
      options: {
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
      },
    },
  },
});
