import {VStack} from '@gamelog/components/ui/vstack';
import AchievementItem from '@gamelog/components/game-view/AchievementItem';
import {Button, ButtonText} from '@gamelog/components/ui/button';
import {Box} from '@gamelog/components/ui/box';
import {useEffect, useState} from 'react';
import {GlobalAchievement} from '@gamelog/api-manager/dto';
import ApiManager from '@gamelog/api-manager/apiManager';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Spinner} from '@gamelog/components/ui/spinner';
import {Text} from "@gamelog/components/ui/text";

interface Props {
    gameID: number;
    playerID: string;
}

export default function GlobalAchievementsBox({gameID, playerID}: Props) {
    const [achievements, setAchievements] = useState<GlobalAchievement>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    useEffect(() => {
        setError(false);
        ApiManager.getGlobalAchievement(gameID)
            .then(setAchievements)
            .catch((err) => {
                console.error('Failed to fetch global achievements:', err);
                setError(true);
            })
            .finally(() => setIsLoading(false));
    }, [gameID]);

    const topAchievements = achievements?.achievementpercentages.achievements.slice(0, 3) || [];

    return (
        <Box className="border-2 p-4 rounded-lg w-full">
            <Text
                size="2xl"
                className="font-bold tracking-widest uppercase mb-4 text-center"
            >
                Global Achievements
            </Text>

            {isLoading ? (
                <Spinner size="large" className="mb-4"/>
            ) : error ? (
                <Text className="text-error-500 mb-4 text-center">
                    Failed to load global achievements, please try again later.
                </Text>
            ) : (
                <VStack className="mb-4">
                    {topAchievements.map((item, index) => (
                        <AchievementItem key={index} name={item.name} percentage={item.percent}/>
                    ))}
                </VStack>
            )}

            <Button
                onPress={() => navigation.navigate('AchievementsList', {achievements, gameID, playerID})}
                className="w-full py-2"
            >
                <ButtonText>See More</ButtonText>
            </Button>
        </Box>
    );
}
