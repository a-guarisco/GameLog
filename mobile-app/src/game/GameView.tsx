import {Box} from '@gamelog/components/ui/box';
import {Text} from '@gamelog/components/ui/text';
import AchievementItem from "@gamelog/components/game-view/AchievementItem";
import {VStack} from "@gamelog/components/ui/vstack";
import {Button} from "@gamelog/components/ui/button";

const GameView = () => {
    return (
        <Box className="flex-1 items-center justify-center">
            <Text className="text-base">This is the game page!</Text>
            <Box className="border-2 border-outline-0 p-4 rounded-lg w-full">
                <Text variant="h2"
                        className="text-typography-0 font-bold tracking-widest uppercase mb-4 text-center">
                    Achievements
                </Text>

                <VStack className="mb-4">
                    <AchievementItem name="TEST" percentage={100} unlockTime={1458825672}/>
                    <AchievementItem name="TEST2" percentage={50}/>
                    <AchievementItem name="TEST3" percentage={1} unlockTime={1658825672}/>
                </VStack>

                <Button className="w-full bg-background-800 border border-outline-0 py-2">
                    <Text variant="body" className="text-typography-0 font-bold text-center">
                        See More
                    </Text>
                </Button>
            </Box>
        </Box>
    );
};

export default GameView;
