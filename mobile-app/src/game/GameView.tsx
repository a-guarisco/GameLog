import GlobalAchievementsPreview from '@gamelog/components/game-view/GlobalAchievementsPreview';
import {Box} from "@gamelog/components/ui/box";
import {Text} from "@gamelog/components/ui/text";

const GameView = () => {
    // todo a prop will provide these from the GameList page
    const gameID = 236390;
    const playerID = '76561198077919169';

    return (
        <Box className="flex-1 items-center justify-center">
            <Text className="text-base">This is the game page!</Text>
            <GlobalAchievementsPreview gameID={gameID} playerID={playerID}/>
        </Box>
    );
};

export default GameView;
