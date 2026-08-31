import { Image, Pressable } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';

interface ReportGameListProps {
  sortedGameReports: any[];
  gameNames: Record<string, string>;
  handleGamePress: (appId: string, playTime: number) => void;
}

const ReportGameList = ({ sortedGameReports, gameNames, handleGamePress }: ReportGameListProps) => {
  return (
    <VStack space="sm" className="mt-2">
      {sortedGameReports.map((game) => (
        <Pressable
          key={game.app_id}
          testID="game-list-item"
          onPress={() => handleGamePress(game.app_id, game.today_play_time)}
          className="active:opacity-70"
        >
          <HStack space="md" className="items-center py-1">
            <Image
              source={{ uri: steamAssetUrls.getGameCapsuleImage(game.app_id) }}
              className="w-16 h-16 rounded-sm bg-background-300 shrink-0"
              resizeMode="cover"
            />
            <VStack className="flex-1 justify-center">
              <Text
                size="sm"
                className="font-bold uppercase text-typography-0 leading-tight"
                numberOfLines={1}
              >
                {gameNames[game.app_id] || `App ID: ${game.app_id}`}
              </Text>
              <HStack space="md" className="mt-1 flex-wrap">
                <Text size="xs" className="font-medium text-typography-300">
                  Playtime:{' '}
                  <Text size="xs" className="font-bold text-typography-100">
                    {formatMinutesToHoursShort(game.today_play_time)}
                  </Text>
                </Text>
                <Text size="xs" className="font-medium text-typography-300">
                  Streak:{' '}
                  <Text size="xs" className="font-bold text-typography-100">
                    {game.streak} days
                  </Text>
                </Text>
                {game.days_played_count !== undefined && (
                  <Text size="xs" className="font-medium text-typography-300">
                    Days played:{' '}
                    <Text size="xs" className="font-bold text-typography-100">
                      {game.days_played_count}
                    </Text>
                  </Text>
                )}
                {game.max_playtime_per_day !== undefined && (
                  <Text size="xs" className="font-medium text-typography-300">
                    Max/day:{' '}
                    <Text size="xs" className="font-bold text-typography-100">
                      {formatMinutesToHoursShort(game.max_playtime_per_day)}
                    </Text>
                  </Text>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Pressable>
      ))}
    </VStack>
  );
};

export default ReportGameList;
