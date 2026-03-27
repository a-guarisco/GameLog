import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import GameListView from '@gamelog/game-list/GameListView';
import ProfileView from '@gamelog/profile/ProfileView';
import GameView from '@gamelog/game/GameView';
import AchievementsListView from '@gamelog/game/AchievementsListView';
import { DevView, PaletteView, FontsView } from '@gamelog/dev';
import GameBanner from '@gamelog/components/game-view/GameBanner';
import ProfileBanner from '@gamelog/components/profile-view/ProfileBanner';

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

const renderProfileBannerHeader = (route: any) => {
  /*const profile = route?.params?.profile;
    if (!profile) {
        console.log("No profile data found in route params:", route?.params);
        return null;
    }*/
  const userId = '76561198077919169'; //todo fix, userID should be present in route after onBoarding
  return <ProfileBanner userId={userId} />;
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
      options: ({ route }: any) => ({
        header: () => renderGameBannerHeader(route),
      }),
    },
    AchievementsList: {
      screen: AchievementsListView,
      options: ({ route }: any) => ({
        header: () => renderGameBannerHeader(route),
      }),
    },
  },
});

export const TestingStack = createNativeStackNavigator({
  screens: {
    TestingMain: {
      screen: DevView,
      options: { headerShown: false },
    },
    DevPalette: {
      screen: PaletteView,
      options: { headerShown: false },
    },
    DevFonts: {
      screen: FontsView,
      options: { headerShown: false },
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
        header: ({ route }) => renderProfileBannerHeader(route),
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
