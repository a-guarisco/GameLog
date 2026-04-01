import { useMemo, useState } from 'react';
import { PieChart } from 'react-native-gifted-charts';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { OS_COLORS, computePieInnerRadius, computePieRadius } from '../chartsHelpers';
import { OsPieData } from '../charts.type';
import ChartWrapperCard from '../ChartWrapperCard';

const OsShareChart = () => {
  const [userId] = useState('76561198077919169');
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(userId, false);

  const pieData = useMemo(() => {
    if (!ownedGames || !ownedGames.response) return [];
    return buildPieData(ownedGames.response.games);
  }, [ownedGames]);

  return (
    <ChartWrapperCard isLoading={isLoadingOwnedGames} error={!!errorOwnedGames}>
      {({ cardWidth, theme }) => (
        <PieChart
          data={pieData}
          donut
          showGradient
          showTooltip
          showValuesAsTooltipText
          sectionAutoFocus
          radius={computePieRadius(cardWidth)}
          innerRadius={computePieInnerRadius(computePieRadius(cardWidth))}
          innerCircleColor={`rgb(${theme['--color-background-100']})`}
          isAnimated
          animationDuration={500}
          showText
          textSize={12}
          textColor={`rgb(${theme['--color-typography-200']})`}
          showValuesAsLabels={false}
          showTextBackground={false}
        />
      )}
    </ChartWrapperCard>
  );
};

const buildPieData = (games: OwnedGames['response']['games']): OsPieData[] => {
  const totals = games.reduce(
    (acc, game) => {
      acc.Windows += game.playtime_windows_forever ?? 0;
      acc.Mac += game.playtime_mac_forever ?? 0;
      acc.Linux += game.playtime_linux_forever ?? 0;
      acc['Steam Deck'] += game.playtime_deck_forever ?? 0;
      return acc;
    },
    { Windows: 0, Mac: 0, Linux: 0, 'Steam Deck': 0 }
  );

  return (Object.entries(totals) as [string, number][])
    .filter(([, minutes]) => minutes > 0)
    .map(([platform, minutes]) => ({
      value: Math.trunc(minutes / 60),
      text: `${platform}: ${Math.trunc(minutes / 60)}h`,
      ...OS_COLORS[platform],
    }));
};

export default OsShareChart;
