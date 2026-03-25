import { useMemo, useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { Box } from '@gamelog/components/ui/box';
import { Text } from '@gamelog/components/ui/text';
import { brand } from '@gamelog/theme/theme';
import { INFO_GRADIENT_TIERS, computePieRadius, computePieInnerRadius } from '../chartsHelpers';
import ChartWrapperCard from '../ChartWrapperCard';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import ExternalLabelBox from '../ExternalLabelBox';
import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';

interface PieData {
  value: number;
  label: string;
  color: string;
  gradientCenterColor: string;
}

const TotalHoursPieChart = () => {
  const [userId] = useState('76561198159652025');
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(userId, false);

  const pieData: PieData[] = useMemo(() => {
    return getPieData(ownedGames);
  }, [ownedGames]);

  const totalMinutes = pieData.reduce((sum, d) => sum + d.value, 0);

  const lamdaFormatLabel = (text: string) => {
    const value = parseInt(text);
    return `${formatMinutes(value)} · ${Math.round((value / totalMinutes) * 100)}%`;
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
    <ChartWrapperCard isLoading={isLoadingOwnedGames} error={!!errorOwnedGames}>
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

          <ExternalLabelBox
            graphData={pieData.map((item) => ({ ...item, lamdaFormatLabel }))}
            theme={theme}
          />
        </>
      )}
    </ChartWrapperCard>
  );
};

export default TotalHoursPieChart;

const getPieData = (ownedGames: OwnedGames | null): PieData[] => {
  if (!ownedGames?.response?.games) return [];

  const games = ownedGames.response.games;

  const sorted = [...games]
    .filter((g) => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever);

  const topN = 5;
  const top = sorted.slice(0, topN);

  const otherMinutes = sorted.slice(topN).reduce((sum, g) => sum + g.playtime_forever, 0);

  const slices: PieData[] = top.map((game, i) => ({
    value: game.playtime_forever,
    label: game.name.length > 12 ? game.name.slice(0, 12) + '…' : game.name,
    color: INFO_GRADIENT_TIERS[i % INFO_GRADIENT_TIERS.length].frontColor,
    gradientCenterColor: INFO_GRADIENT_TIERS[i % INFO_GRADIENT_TIERS.length].gradientColor,
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
