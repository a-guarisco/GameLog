import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import { GameHeaderCard } from '@gamelog/common/GameHeaderCard';
import { OwnedGames } from '@gamelog/api-manager/dto';

type GameOverviewStatsCardProps = {
  gameItem: OwnedGames['response']['games'][0];
  onPress?: () => void;
};

export const GameOverviewStatsCard = ({ gameItem, onPress }: GameOverviewStatsCardProps) => {
  return (
    <GameHeaderCard name={gameItem.name} appid={gameItem.appid} onPress={onPress}>
      <Box className="mt-2 gap-y-0.5">
        <Box className="flex-row justify-between items-center">
          <Text className="font-semibold text-typography-0 uppercase">Total:</Text>
          <Text className="text-typography-0 font-bold">
            {Math.floor(gameItem.playtime_forever / 60)}h
          </Text>
        </Box>

        <Box className="h-[1px] bg-outline-50 my-0" />

        <Box className="flex-row flex-wrap">
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">
              Windows: {Math.floor(gameItem.playtime_windows_forever / 60)}h
            </Text>
          </Box>
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">
              MacOS: {Math.floor(gameItem.playtime_mac_forever / 60)}h
            </Text>
          </Box>
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">
              Linux: {Math.floor(gameItem.playtime_linux_forever / 60)}h
            </Text>
          </Box>
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">
              Deck: {Math.floor(gameItem.playtime_deck_forever / 60)}h
            </Text>
          </Box>
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">Last played:</Text>
          </Box>
          <Box className="w-1/2">
            <Text className="font-extralight text-typography-200">
              {new Date(gameItem.rtime_last_played * 1000).toLocaleDateString()}
            </Text>
          </Box>
        </Box>

        <Text className="text-typography-400">ID: {gameItem.appid}</Text>
      </Box>
    </GameHeaderCard>
  );
};
