import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@gamelog/components/ui/card';
import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Spinner } from '@gamelog/components/ui/spinner';
import apiManager from '@gamelog/api-manager/apiManager';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface BarData {
  value: number;
  appid: string;
  frontColor: string;
  gradientColor: string;
  spacing: number;
  label: string;
}

const TotalHoursChart = () => {
  const [chartWidth, setChartWidth] = useState(0);
  const [userId, setUserId] = useState('76561198159652025');
  const [barData, setBarData] = useState<
    {
      value: number;
      frontColor: string;
      gradientColor: string;
      spacing: number;
      label: string;
    }[]
  >([]);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    apiManager.getOwnedGames(userId, false).then((response) => {
      const data = response.response.games.map(
        (game: { playtime_forever: any; name: string; appid: string }) => ({
          value: Math.trunc(game.playtime_forever / 60),
          appid: game.appid,
          frontColor: '#006DFF',
          gradientColor: '#009FFF',
          spacing: 15,
          label: game.name.length > 10 ? game.name.slice(0, 10) + '...' : game.name,
        })
      );
      const sortedData = data.sort((a, b) => b.value - a.value).slice(0, 10);
      console.log(sortedData);
      setBarData(sortedData);
    });
  }, [userId]);

  return (
    <View style={{ width: '95%', alignItems: 'center', overflow: 'hidden' }}>
      <Card
        className="w-full pr-50 rounded-lg"
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      >
        {chartWidth === 0 ? (
          <Spinner />
        ) : (
          <View style={{ width: chartWidth - 30, overflow: 'hidden' }}>
            <BarChart
              //  horizontal
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
              yAxisTextStyle={{ color: 'lightgray', fontSize: 10 }}
              yAxisLabelSuffix="h"
              xAxisType={'dashed'}
              xAxisColor={'lightgray'}
              noOfSections={6}
              maxValue={Math.max(...barData.map((d) => d.value))}
              labelWidth={40}
              xAxisLabelTextStyle={{ color: 'lightgray', textAlign: 'center', fontSize: 10 }}
              onPress={(_item: BarData) => {
                console.log('Pressed bar with hours:', _item.appid);
                navigation.navigate('GameList', {
                  screen: 'Game',
                  params: { appid: _item.appid },
                });
              }}
            />
          </View>
        )}
      </Card>
    </View>
  );
};

export default TotalHoursChart;
