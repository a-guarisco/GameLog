import { useMemo } from 'react';
import { BarChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { brand } from '@gamelog/theme/theme';
import ChartWrapperCard from '../ChartWrapperCard';
import { BarData } from '../charts.type';
import buildTotalHoursBarData from './buildTotalHoursBarData';
import { parseRGB } from '../chartsHelpers';

interface TotalHoursChartProps {
  ownedGames?: any;
  isLoadingOwnedGames?: boolean;
  errorOwnedGames?: any;
}

const PRIMARY_400 = parseRGB(brand.primary['400']);

const TotalHoursChart = ({
  ownedGames,
  isLoadingOwnedGames = false,
  errorOwnedGames,
}: TotalHoursChartProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const barData: BarData[] = useMemo(() => {
    const raw = buildTotalHoursBarData(ownedGames);
    return raw.map((item) => ({ ...item, frontColor: PRIMARY_400, gradientColor: undefined }));
  }, [ownedGames]);

  return (
    <ChartWrapperCard
      label="Hours per game"
      isLoading={isLoadingOwnedGames}
      error={!!errorOwnedGames}
      testID="total-hours-chart"
    >
      {({ cardWidth, theme }) => {
        const axisColor = parseRGB(theme['--color-typography-200']);
        const outlineColor = parseRGB(theme['--color-outline-100']);

        return (
          <Box style={{ overflow: 'hidden', width: '100%', alignItems: 'center' }}>
            <BarChart
              parentWidth={cardWidth || 370}
              adjustToWidth
              data={barData}
              barWidth={40}
              initialSpacing={10}
              spacing={14}
              isAnimated
              animationDuration={600}
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisThickness={0}
              hideYAxisText
              rulesType="dashed"
              rulesColor={outlineColor}
              yAxisTextStyle={{ color: axisColor }}
              xAxisType={'dashed'}
              xAxisColor={axisColor}
              noOfSections={4}
              maxValue={Math.max(...barData.map((d) => d.value))}
              labelWidth={40}
              xAxisLabelTextStyle={{
                color: axisColor,
                textAlign: 'center',
                fontSize: 10,
                fontWeight: '600',
              }}
              onPress={(item: any, index: number) => {
                const gameItem = barData[index] ?? item;
                if (gameItem && gameItem.appid) {
                  navigation.navigate('GameList', {
                    screen: 'Game',
                    params: { gameItem: { appid: gameItem.appid, name: gameItem.name } },
                  });
                }
              }}
            />
          </Box>
        );
      }}
    </ChartWrapperCard>
  );
};

export default TotalHoursChart;
