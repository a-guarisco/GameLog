import { useEffect, useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import apiManager from '@gamelog/api-manager/apiManager';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { Spinner } from '@gamelog/components/ui/spinner';
import { Card } from '@gamelog/components/ui/card';
import { Box } from '@gamelog/components/ui/box';
import { brand } from '@gamelog/theme/theme';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';
import { useColorScheme } from 'react-native';
import { Text } from '@gamelog/components/ui/text';

interface PieData {
  value: number;
  color: string;
  gradientCenterColor: string;
  label: string;
}

const PIE_TIERS: { color: string; gradientCenterColor: string }[] = [
  { color: `rgb(${brand.info['0']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['100']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['200']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['300']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['400']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['500']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['600']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['700']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['800']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
  { color: `rgb(${brand.info['900']})`, gradientCenterColor: `rgb(${brand.info['500']})` },
];

const buildGameSharePieData = (games: OwnedGames['response']['games'], topN = 5): PieData[] => {
  const sorted = [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever);

  const top = sorted.slice(0, topN);
  const otherMinutes = sorted.slice(topN).reduce((sum, g) => sum + g.playtime_forever, 0);

  const slices: PieData[] = top.map((game, i) => ({
    value: game.playtime_forever,
    label: game.name.length > 12 ? game.name.slice(0, 12) + '…' : game.name,
    ...PIE_TIERS[i % PIE_TIERS.length],
  }));

  if (otherMinutes > 0) {
    slices.push({
      value: otherMinutes,
      label: 'Other',
      color: `rgb(${brand.info['200']})`,
      gradientCenterColor: `rgb(${brand.info['400']})`,
    });
  }

  return slices;
};

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const TotalHoursPieChart = () => {
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId] = useState('76561198159652025');
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? rawConfig.dark : rawConfig.light;

  useEffect(() => {
    apiManager
      .getOwnedGames(userId, false)
      .then((response: OwnedGames) => {
        setPieData(buildGameSharePieData(response.response.games));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching owned games:', error);
      });
  }, [userId]);

  const totalMinutes = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box style={{ width: '95%', alignItems: 'center', overflow: 'hidden' }}>
      <Card
        style={{ backgroundColor: `rgb(${theme['--color-background-100']})` }}
        className="w-full rounded-lg items-center py-4"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <PieChart
              data={pieData}
              donut
              showGradient
              sectionAutoFocus
              radius={110}
              innerRadius={70}
              innerCircleColor={`rgb(${theme['--color-background-100']})`}
              centerLabelComponent={() => <Box style={{ alignItems: 'center' }} />}
              isAnimated
              animationDuration={500}
              showText
              textSize={10}
              textColor={`rgb(${theme['--color-typography-200']})`}
              labelsPosition="outward"
              showValuesAsLabels={false}
              showTextBackground={false}
            />

            <Box
              style={{
                width: '90%',
                height: 1,
                backgroundColor: `rgb(${theme['--color-background-300']})`,
                marginVertical: 12,
              }}
            />
            <Box
              style={{
                width: '90%',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {pieData.map((item) => (
                <Box
                  key={item.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    width: '47%',
                  }}
                >
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Box style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: `rgb(${theme['--color-typography-400']})`,
                        fontSize: 11,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        color: `rgb(${theme['--color-typography-200']})`,
                        fontSize: 10,
                      }}
                    >
                      {formatMinutes(item.value)} · {Math.round((item.value / totalMinutes) * 100)}%
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};

export default TotalHoursPieChart;
