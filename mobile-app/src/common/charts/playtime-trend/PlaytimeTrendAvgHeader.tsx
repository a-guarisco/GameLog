import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import {
  ChartSummaryText,
  ChartContextText,
  ChartDateRangeText,
  ChartDeltaText,
} from '@gamelog/common/typography/ChartTypography';
import { formatShortDate } from '@gamelog/utils/formatUtils';
import type { PlaytimeTrend } from './selectPlaytimeTrend';

interface PlaytimeTrendAvgHeaderProps {
  activePoint: any;
  finalPoint: any;
  trend: PlaytimeTrend;
  finalAverageFormatted: string;
  baselineAverageFormatted: string;
  prevDateRangeStr: string;
}

export const PlaytimeTrendAvgHeader = ({
  activePoint,
  finalPoint,
  trend,
  finalAverageFormatted,
  baselineAverageFormatted,
  prevDateRangeStr,
}: PlaytimeTrendAvgHeaderProps) => {
  if (activePoint) {
    return (
      <VStack className="w-full pl-2">
        <HStack space="sm" className="items-baseline w-full flex-wrap">
          <ChartSummaryText>{activePoint.currentAverageFormatted}</ChartSummaryText>
          {activePoint.dataPointText !== 'Previous Period Average' && (
            <ChartDeltaText isPositive={activePoint.isPositive}>
              {activePoint.isPositive ? '+' : ''}
              {Math.round(activePoint.percentChange)}%, Δ {activePoint.isPositive ? '+' : '-'}
              {activePoint.deltaFormatted}
            </ChartDeltaText>
          )}
          <ChartDateRangeText className="ml-auto pr-2">
            {activePoint.dataPointText}
          </ChartDateRangeText>
        </HStack>
        <HStack>
          {activePoint.dataPointText === 'Previous Period Average' ? (
            <ChartContextText>base{prevDateRangeStr}</ChartContextText>
          ) : (
            <ChartContextText>TOT: {activePoint.cumulativeFormatted}</ChartContextText>
          )}
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack className="w-full pl-2">
      <HStack space="sm" className="items-baseline w-full flex-wrap">
        <ChartSummaryText>{finalAverageFormatted}</ChartSummaryText>
        {finalPoint && finalPoint.dataPointText !== 'Previous Period Average' && (
          <ChartDeltaText isPositive={finalPoint.isPositive}>
            {finalPoint.isPositive ? '+' : ''}
            {Math.round(finalPoint.percentChange)}%, Δ {finalPoint.isPositive ? '+' : '-'}
            {finalPoint.deltaFormatted}
          </ChartDeltaText>
        )}
        <ChartDateRangeText className="ml-auto pr-2">
          {trend.days && trend.days.length > 0
            ? `${formatShortDate(new Date(trend.days[0].date).getTime() / 1000)} - ${formatShortDate(new Date(trend.days[trend.days.length - 1].date).getTime() / 1000)}`
            : ''}
        </ChartDateRangeText>
      </HStack>
      <HStack>
        <ChartContextText>
          base: {baselineAverageFormatted}
          {prevDateRangeStr}
        </ChartContextText>
      </HStack>
    </VStack>
  );
};
