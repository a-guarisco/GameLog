import { useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '@gamelog/common/gluestack/box';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { brand } from '@gamelog/theme/theme';
import SectionCard from '@gamelog/common/SectionCard';
import SectionState from '@gamelog/common/SectionState';
import { BarData } from '../charts.type';
import buildTotalHoursBarData from './buildTotalHoursBarData';

interface TotalHoursChartProps {
  ownedGames?: any;
  isLoadingOwnedGames?: boolean;
  errorOwnedGames?: any;
}

const PRIMARY_400 = `rgb(${brand.primary['400']})`;

const TotalHoursChart = ({
  ownedGames,
  isLoadingOwnedGames = false,
  errorOwnedGames,
}: TotalHoursChartProps) => {
  let navigation: NativeStackNavigationProp<any> | null = null;
  try {
    navigation = useNavigation<NativeStackNavigationProp<any>>();
  } catch {}
  const [chartWidth, setChartWidth] = useState(0);
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  const barData: BarData[] = useMemo(() => {
    const raw = buildTotalHoursBarData(ownedGames);
    return raw.map((item) => ({ ...item, frontColor: PRIMARY_400, gradientColor: undefined }));
  }, [ownedGames]);

  const hasError = !!errorOwnedGames;
  const isEmpty = !hasError && barData.length === 0;
  const showChart = !isLoadingOwnedGames && !hasError && !isEmpty;

  const axisColor = `rgb(${theme['--color-typography-200']})`;

  return (
    <SectionCard label="Hours per game" testID="total-hours-chart">
      <SectionState
        isLoading={isLoadingOwnedGames}
        hasError={hasError}
        isEmpty={isEmpty}
        errorMessage="Could not load playtime"
        emptyMessage="No playtime recorded yet"
      />

      {!isLoadingOwnedGames && !hasError && !isEmpty && (
        <Box
          style={{ overflow: 'hidden' }}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        >
          {showChart && (
            <BarChart
              parentWidth={chartWidth || 370}
              adjustToWidth
              data={barData}
              barWidth={40}
              initialSpacing={10}
              spacing={14}
              isAnimated
              animationDuration={500}
              barBorderRadius={4}
              yAxisThickness={0}
              xAxisThickness={0}
              hideYAxisText
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
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
              onPress={(item: any, index: number) => {
                const appid = barData[index]?.appid ?? item?.appid;
                if (appid) {
                  navigation?.navigate('GameList', {
                    screen: 'Game',
                    params: { appid },
                  });
                }
              }}
            />
          )}
        </Box>
      )}
    </SectionCard>
  );
};

export default TotalHoursChart;
