import { BarChart } from 'react-native-gifted-charts';
import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/components/ui/box';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { getPercentileInfoGradient } from '../chartsHelpers';
import ChartWrapperCard from '../ChartWrapperCard';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { BarData } from '../charts.type';

const USER_ID = '76561198159652025';

const TotalHoursChart = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(USER_ID, false);

  const barData: BarData[] = useMemo(() => {
    return getBarData(ownedGames);
  }, [ownedGames]);

  return (
    <ChartWrapperCard isLoading={isLoadingOwnedGames} error={!!errorOwnedGames}>
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

const getBarData = (ownedGames: OwnedGames | null): BarData[] => {
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

  return sortedData.map((item) => ({
    ...item,
    ...getPercentileInfoGradient(item.value, min, max),
  }));
};

export default TotalHoursChart;
