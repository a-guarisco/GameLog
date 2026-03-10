import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import GameList from "./game-list/GameList"
import Profile from "./profile/Profile"
import Game from "./game/Game"

export const GameListStack = createNativeStackNavigator({
    screens: {
        HomePage: {
            screen: GameList,
            options: { headerShown: false }
        },
        Game: {
            screen: Game,
            options: { headerShown: false }
        },
    }
})

export const RootTabs = createBottomTabNavigator({
    screens: {
        GameList: GameListStack,
        Profile: Profile,
    }
})