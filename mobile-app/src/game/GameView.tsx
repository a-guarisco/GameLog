import {TextGL, ViewGL} from '@gamelog/common';
import AchievementItem from "@gamelog/components/game-view/AchievementItem";
import {VStack} from "@gamelog/components/ui/vstack";
import {Box} from "@gamelog/components/ui/box";
import {Button} from "@gamelog/components/ui/button";
import ApiManager from "@gamelog/api-manager/apiManager";
import {GlobalAchievement} from "@gamelog/api-manager/dto";
import {useEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

const GameView = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // todo a prop will provide these from the GameList page
    const gameID = 236390;
    const playerID = "76561198077919169";
    const [achievements, setAchievements] = useState<GlobalAchievement>();

    useEffect(() => {
        ApiManager.getGlobalAchievement(gameID).then(setAchievements);
    }, [gameID]);
    const topAchievements = achievements?.achievementpercentages.achievements.slice(0, 3) || [];

    return (
        <VStack className="flex-1 p-4">
            <ViewGL align="center">
                <TextGL variant="body">This is the game page!</TextGL>
            </ViewGL>
            <Box className="border-2 border-outline-0 p-4 rounded-lg w-full">
                <TextGL variant="h2" className="text-typography-0 font-bold tracking-widest uppercase mb-4 text-center">
                    Global Achievements
                </TextGL>

                <VStack className="mb-4">
                    {topAchievements.map((item, index) => (
                        <AchievementItem
                            key={index}
                            name={item.name}
                            percentage={item.percent}
                        />
                    ))}
                </VStack>

                <Button
                    onPress={() => navigation.navigate('AchievementsList', { achievements, gameID, playerID })}
                    className="w-full bg-background-800 border border-outline-0 py-2"
                >
                    <TextGL variant="body" className="text-typography-0 font-bold text-center">
                        See More
                    </TextGL>
                </Button>
            </Box>
        </VStack>

    );
};

export default GameView;
