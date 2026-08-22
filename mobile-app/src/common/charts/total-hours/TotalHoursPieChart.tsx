import { useMemo } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { computePieRadius, computePieInnerRadius, parseRGB } from '../chartsHelpers';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';
import ChartWrapperCard from '../ChartWrapperCard';
import { rawConfig } from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import buildTotalHoursPieData from './buildTotalHoursPieData';
import { PieData } from '../charts.type';
interface TotalHoursPieChartProps {
  ownedGames?: any;
  isLoadingOwnedGames?: boolean;
  errorOwnedGames?: any;
}

const GAME_TO_REPRESENT = 5;

const TotalHoursPieChart = ({
  ownedGames,
  isLoadingOwnedGames = false,
  errorOwnedGames,
}: TotalHoursPieChartProps) => {
  const pieData: PieData[] = useMemo(() => {
    return buildTotalHoursPieData(ownedGames, GAME_TO_REPRESENT);
  }, [ownedGames]);

  const totalMinutes = pieData.reduce((sum, d) => sum + d.value, 0);

  const lamdaFormatLabel = (text: string) => {
    const value = parseInt(text);
    return `${formatMinutesToHours(value)} · ${Math.round((value / totalMinutes) * 100)}%`;
  };

  const tooltipComponent = (index: number, theme: typeof rawConfig.light) => {
    const { value, label } = pieData[index];
    return (
      <Text style={{ color: theme['--color-typography-100'], fontSize: 12 }}>
        {label} | {lamdaFormatLabel(value.toString())}
      </Text>
    );
  };

  return (
    <ChartWrapperCard
      label="Time per Category"
      isLoading={isLoadingOwnedGames}
      error={!!errorOwnedGames}
    >
      {({ cardWidth, theme }) => (
        <>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            showTooltip
            tooltipComponent={(index: number) => tooltipComponent(index, theme)}
            radius={computePieRadius(cardWidth)}
            innerRadius={computePieInnerRadius(computePieRadius(cardWidth))}
            innerCircleColor={parseRGB(theme['--color-background-50'])}
            centerLabelComponent={() => (
              <Box style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                {pieData.map((item) => (
                  <Box key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      style={{ color: `rgb(${theme['--color-typography-200']})`, fontSize: 10, fontWeight: '600' }}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
            isAnimated
            animationDuration={500}
            showValuesAsLabels={false}
            showTextBackground={false}
          />
        </>
      )}
    </ChartWrapperCard>
  );
};

export default TotalHoursPieChart;
