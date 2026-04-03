import { useMemo } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import ChartWrapperCard from '../ChartWrapperCard';
import { BarData } from '../charts.type';
import buildTotalHoursBarData from './buildTotalHoursBarData';

const USER_ID = '76561198077919169';

const TotalHoursChart = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(USER_ID, false);

  const barData: BarData[] = useMemo(() => {
    return buildTotalHoursBarData(ownedGames);
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

export default TotalHoursChart;
