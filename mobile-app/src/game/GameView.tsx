import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import ApiManager from '@gamelog/api-manager/apiManager';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { PlayerAchievement } from '@gamelog/api-manager/dto';
import { useState } from 'react';

const GameView = () => {
  const appId = 236390;
  const userId = '76561198077919169';
  const [achievements, setAchievements] = useState<PlayerAchievement>();
  return (
    <Box className="flex-1 items-center justify-center">
      <Text className="text-base">This is the game page!</Text>
      <Button
        onPress={() =>
          ApiManager.getAllPlayerAchievementsPerApp(appId, userId)
            .then(setAchievements)
            .catch((err) => {
              console.error('Failed to fetch global achievements:', err);
            })
        }
      >
        <ButtonText>Test API</ButtonText>
      </Button>
      <Text>
        {achievements
          ? `Achievements: ${achievements.playerstats.achievements.map((a) => a.apiname).join(', ')}`
          : 'No achievements loaded'}
      </Text>
    </Box>
  );
};

export default GameView;
