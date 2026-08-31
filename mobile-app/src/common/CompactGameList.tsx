import { Image, Pressable, View } from 'react-native';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { formatMinutesToHoursShort } from '@gamelog/utils/formatUtils';

interface CompactGameListRow {
  testID?: string;
  app_id?: string | number;
  appId?: string | number;
  gameSteamId?: string | number;
  today_play_time?: number;
  requester_play_time?: number;
  friend_play_time?: number;
  streak?: number;
  days_played_count?: number;
  max_playtime_per_day?: number;
  detail_rows?: {
    label: string;
    value: string;
    valueClassName?: string;
  }[];
}

interface CompactGameListProps {
  sortedGameReports?: any[];
  items?: CompactGameListRow[];
  gameNames: Record<string, string>;
  handleGamePress: (appId: string, playTime: number) => void;
}

const resolveAppId = (game: CompactGameListRow) =>
  String(game.app_id ?? game.appId ?? game.gameSteamId ?? '');

const resolvePlayTime = (game: CompactGameListRow) =>
  Number(game.today_play_time ?? game.requester_play_time ?? game.friend_play_time ?? 0);

const CompactGameList = ({
  sortedGameReports,
  items,
  gameNames,
  handleGamePress,
}: CompactGameListProps) => {
  const listData = items ?? sortedGameReports ?? [];

  return (
    <VStack space="sm" className="mt-2">
      {listData.map((game) => {
        const appId = resolveAppId(game);
        const playTime = resolvePlayTime(game);
        const detailRows = game.detail_rows ?? [
          {
            label: 'Playtime:',
            value: formatMinutesToHoursShort(game.today_play_time ?? playTime),
            valueClassName: 'text-typography-100',
          },
          {
            label: 'Streak:',
            value: `${game.streak ?? 0} days`,
            valueClassName: 'text-typography-100',
          },
          ...(game.days_played_count !== undefined
            ? [
              {
                label: 'Days played:',
                value: String(game.days_played_count),
                valueClassName: 'text-typography-100',
              },
            ]
            : []),
          ...(game.max_playtime_per_day !== undefined
            ? [
              {
                label: 'Max/day:',
                value: formatMinutesToHoursShort(game.max_playtime_per_day),
                valueClassName: 'text-typography-100',
              },
            ]
            : []),
        ];

        return (
          <Pressable
            key={appId || `${game.streak ?? 'unknown'}-${game.days_played_count ?? '0'}`}
            testID={game.testID ?? 'game-list-item'}
            onPress={() => handleGamePress(appId, playTime)}
            className="active:opacity-70"
          >
            <HStack space="md" className="items-center py-1">
              <Image
                source={{ uri: steamAssetUrls.getGameCapsuleImage(appId) }}
                className="w-16 h-16 rounded-sm bg-background-300 shrink-0"
                resizeMode="cover"
              />
              <VStack className="flex-1 justify-center" space="xs">
                <Text
                  size="sm"
                  className="font-bold uppercase text-typography-0 leading-tight"
                  numberOfLines={1}
                >
                  {gameNames[appId] || `App ID: ${appId}`}
                </Text>
                <View className="flex-row flex-wrap items-center">
                  {detailRows.map((row, index) => (
                    <Text
                      key={`${row.label}-${index}`}
                      size="xs"
                      className="font-medium text-typography-300 mr-2.5 mb-0.5"
                    >
                      {row.label}{' '}
                      <Text
                        size="xs"
                        className={`font-bold ${row.valueClassName ?? 'text-typography-100'}`}
                      >
                        {row.value}
                      </Text>
                    </Text>
                  ))}
                </View>
              </VStack>
            </HStack>
          </Pressable>
        );
      })}
    </VStack>
  );
};

export default CompactGameList;
