import { BarChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/components/ui/box';
import { INFO_GRADIENT_TIERS } from '../chartsHelpers';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import ChartWrapperCard from '../ChartWrapperCard';

interface BarData {
  value: number;
  appid: string;
  frontColor: string;
  gradientColor: string;
  spacing: number;
  label: string;
}

const USER_ID = '76561198159652025';

const getInfoGradient = (
  value: number,
  min: number,
  max: number
): { frontColor: string; gradientColor: string } => {
  const range = max - min;
  const percentile = range === 0 ? 1 : (value - min) / range;

  const tierIndex =
    percentile < 0.1 ? 0 : percentile < 0.2 ? 1 : percentile < 0.3 ? 2 : percentile < 0.4 ? 4
    : percentile < 0.5 ? 5 : percentile < 0.6 ? 6 : percentile < 0.7 ? 7 : percentile < 0.8 ? 8 : 9;

  return INFO_GRADIENT_TIERS[tierIndex];
};

const TotalHoursChart = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(USER_ID, false);


  const barData: BarData[] = (() => {
    if (!ownedGames?.response?.games) return [];

    const data = ownedGames.response.games.map(
      (game: { playtime_forever: number; name: string; appid: string }) => ({
        value: Math.trunc(game.playtime_forever / 60),
        appid: game.appid,
        frontColor: '',
        gradientColor: '',
        spacing: 12,
        label: game.name.length > 10 ? game.name.slice(0, 100) + '...' : game.name,
      })
    );

    const sortedData = data.sort((a, b) => b.value - a.value).slice(0, 100);
    const min = Math.min(...sortedData.map((d) => d.value));
    const max = Math.max(...sortedData.map((d) => d.value));

    return sortedData.map((item) => ({ ...item, ...getInfoGradient(item.value, min, max) }));
  })();


  return (
      <ChartWrapperCard
        isLoading={isLoadingOwnedGames}
        error={!!errorOwnedGames}
      >
        {({ cardWidth, theme }) => (
          <Box style={{ width: cardWidth - 30, overflow: 'hidden' }}>
            <BarChart
              parentWidth={cardWidth - 30}
              adjustToWidth
              data={barData}
              barWidth={40}
              initialSpacing={10}
              spacing={14}
              isAnimated
              showGradient
              animationDuration={500}
              barBorderRadius={4}
              yAxisThickness={0}
              yAxisLabelWidth={30}
              yAxisTextStyle={{ color: `rgb(${theme['--color-typography-200']})`, fontSize: 10 }}
              yAxisLabelSuffix="h"
              xAxisType={'dashed'}
              xAxisColor={`rgb(${theme['--color-typography-200']})`}
              noOfSections={6}
              maxValue={Math.max(...barData.map((d) => d.value))}
              labelWidth={40}
              xAxisLabelTextStyle={{
                color: `rgb(${theme['--color-typography-200']})`,
                textAlign: 'center',
                fontSize: 10,
              }}
              onPress={(_item: BarData) => {
                navigation.navigate('GameList', {
                  screen: 'Game',
                  params: { appid: _item.appid },
                });
              }}
            />
          </Box>
        )}
      </ChartWrapperCard>
  );
};

export default TotalHoursChart;