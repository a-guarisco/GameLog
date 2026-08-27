import { ScrollView, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';

import { useTotalHoursChart } from './useTotalHoursChart';

import type { OwnedGames } from '@gamelog/api-manager/dto';

interface TotalHoursChartProps {
  ownedGames?: OwnedGames | null;
}

const TotalHoursChart = ({ ownedGames }: TotalHoursChartProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { barData } = useTotalHoursChart(ownedGames);

  return (
    <ChartWrapperCard
      label="Hours per game"
      isLoading={false}
      error={false}
      testID="total-hours-chart"
    >
      {({ cardWidth, theme }) => {
        if (barData.length === 0) {
          return (
            <Box className="py-8 items-center justify-center w-full">
              <Text className="text-typography-400">No games found</Text>
            </Box>
          );
        }

        const maxHours = barData.length > 0 ? Math.max(...barData.map((d) => d.value)) : 1;

        return (
          <ScrollView
            style={{ width: '100%', maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
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
                      {/* Game Image / Icon fallback */}
                      <Image
                        source={{
                          uri: `https://steamcdn-a.akamaihd.net/steam/apps/${gameItem.appid}/capsule_184x69.jpg`,
                        }}
                        style={{ width: 46, height: 21, borderRadius: 4, backgroundColor: '#333' }}
                        resizeMode="cover"
                      />

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
