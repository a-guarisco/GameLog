import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@gamelog/components/ui/card';
import { useState, useEffect } from 'react';
import { Spinner } from '@gamelog/components/ui/spinner';
import apiManager from '@gamelog/api-manager/apiManager';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { brand } from '@gamelog/theme/theme';
import { Box } from '@gamelog/components/ui/box';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';
import { useColorScheme } from 'react-native';

interface BarData {
  value: number;
  appid: string;
  frontColor: string;
  gradientColor: string;
  spacing: number;
  label: string;
}

const INFO_GRADIENT_TIERS: [string, string][] = [
  [`rgb(${brand.info['100']})`, `rgb(${brand.info['500']})`],
  [`rgb(${brand.info['300']})`, `rgb(${brand.info['500']})`],
  [`rgb(${brand.info['500']})`, `rgb(${brand.info['500']})`],
  [`rgb(${brand.info['700']})`, `rgb(${brand.info['500']})`],
  [`rgb(${brand.info['900']})`, `rgb(${brand.info['500']})`],
];

const getInfoGradient = (
  value: number,
  min: number,
  max: number
): { frontColor: string; gradientColor: string } => {
  const range = max - min;
  const percentile = range === 0 ? 1 : (value - min) / range;

  const tierIndex =
    percentile < 0.2 ? 0 : percentile < 0.4 ? 1 : percentile < 0.6 ? 2 : percentile < 0.8 ? 3 : 4;

  const [frontColor, gradientColor] = INFO_GRADIENT_TIERS[tierIndex];
  return { frontColor, gradientColor };
};

const TotalHoursChart = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const [userId] = useState('76561198159652025');
  const [barData, setBarData] = useState<BarData[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  useEffect(() => {
    apiManager.getOwnedGames(userId, false).then((response) => {
      const data = response.response.games.map(
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

      const coloredData = sortedData.map((item) => ({
        ...item,
        ...getInfoGradient(item.value, min, max),
      }));

      setBarData(coloredData);
    });
  }, [userId]);

  return (
    <Box style={{ width: '95%', alignItems: 'center', overflow: 'hidden' }}>
      <Card
        style={{ backgroundColor: `rgb(${theme['--color-background-100']})` }}
        className="w-full pr-50 rounded-lg"
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {chartWidth === 0 ? (
          <Spinner />
        ) : (
          <Box style={{ width: chartWidth - 30, overflow: 'hidden' }}>
            <BarChart
              parentWidth={chartWidth - 30}
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
      </Card>
    </Box>
  );
};

export default TotalHoursChart;
