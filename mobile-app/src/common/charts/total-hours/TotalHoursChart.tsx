import { ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import GameCapsuleImage from '@gamelog/common/GameCapsuleImage';
import ChartWrapperCard from '../ChartWrapperCard';

import { useTotalHoursChart } from './useTotalHoursChart';

import type { OwnedGames } from '@gamelog/api-manager/dto';

interface TotalHoursChartProps {
  ownedGames?: OwnedGames | null;
  targetHeight?: number;
}

const TotalHoursChart = ({ ownedGames, targetHeight }: TotalHoursChartProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { barData } = useTotalHoursChart(ownedGames);

  return (
    <ChartWrapperCard
      label="Hours per game"
      isLoading={false}
      error={false}
      testID="total-hours-chart"
      style={targetHeight ? { height: targetHeight } : undefined}
    >
      {({ cardWidth, theme }) => {
        if (barData.length === 0) {
          return (
            <Box className="flex-1 items-center justify-center w-full py-8">
              <Text className="text-typography-400 font-medium text-center">No games found</Text>
            </Box>
          );
        }

        const maxHours = barData.length > 0 ? Math.max(...barData.map((d) => d.value)) : 1;
        const scrollHeight = targetHeight ? targetHeight - 55 : undefined;

        return (
          <ScrollView
            style={{ width: '100%', height: scrollHeight, maxHeight: scrollHeight ?? 400 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator={!!scrollHeight}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <VStack space="md" className="w-full mt-2">
              {barData.map((item, index) => {
                const gameItem = item as any; // Cast because we need appid and name which are present
                const percent = Math.max((item.value / maxHours) * 100, 1); // Minimum 1% so the bar is visible

                return (
                  <Pressable
                    key={`${gameItem.appid}-${index}`}
                    onPress={() => {
                      if (gameItem && gameItem.appid) {
                        navigation.navigate('GameListTab', {
                          screen: 'Game',
                          params: { gameItem: { appid: gameItem.appid, name: gameItem.name } },
                        });
                      }
                    }}
                  >
                    <HStack space="md" className="items-center">
                      <GameCapsuleImage appId={gameItem.appid} />

                      {/* Bar and Label */}
                      <VStack className="flex-1" space="xs">
                        <Text size="sm" className="font-bold text-typography-0" numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Box className="w-full h-1.5 bg-background-300 rounded-full overflow-hidden">
                          <Box
                            className="h-full bg-primary-400 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </Box>
                      </VStack>

                      {/* Hours */}
                      <Text size="sm" className="font-bold text-typography-0 w-16 text-right">
                        {formatMinutesToHours(item.value)}
                      </Text>
                    </HStack>
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>
        );
      }}
    </ChartWrapperCard>
  );
};

export default TotalHoursChart;
