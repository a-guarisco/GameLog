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

interface PlaytimeTrendTotHeaderProps {
  activePoint: any;
  trend: PlaytimeTrend;
  cumulativeDeltaInfo: any;
  prevDateRangeStr: string;
}

export const PlaytimeTrendTotHeader = ({
  activePoint,
  trend,
  cumulativeDeltaInfo,
  prevDateRangeStr,
}: PlaytimeTrendTotHeaderProps) => {
  if (activePoint) {
    return (
      <VStack className="w-full pl-2">
        <HStack space="sm" className="items-baseline w-full flex-wrap">
          <ChartSummaryText>{activePoint.cumulativeFormatted}</ChartSummaryText>
          <ChartDeltaText
            isPositive={activePoint.cumulativeStepDeltaRaw > 0}
            isNeutral={activePoint.cumulativeStepDeltaRaw === 0}
          >
            +{Math.round(activePoint.cumulativePercent)}%, Δ +{activePoint.cumulativeFormatted}
          </ChartDeltaText>
          <ChartDateRangeText className="ml-auto pr-2">
            {activePoint.dataPointText}
          </ChartDateRangeText>
        </HStack>
        <HStack>
          <ChartContextText>AVG: {activePoint.currentAverageFormatted}</ChartContextText>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack className="w-full pl-2">
      <HStack space="sm" className="items-baseline w-full flex-wrap">
        <ChartSummaryText>{trend.totalLabel}</ChartSummaryText>
        {cumulativeDeltaInfo && (
          <ChartDeltaText
            isPositive={cumulativeDeltaInfo.isPositive}
            isNeutral={cumulativeDeltaInfo.percentChange === 0}
          >
            {cumulativeDeltaInfo.isPositive ? '+' : ''}
            {Math.round(cumulativeDeltaInfo.percentChange)}%, Δ{' '}
            {cumulativeDeltaInfo.isPositive ? '+' : ''}
            {cumulativeDeltaInfo.deltaFormatted}
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
          base: {cumulativeDeltaInfo?.baselineFormatted || '0m'}
          {prevDateRangeStr}
        </ChartContextText>
      </HStack>
    </VStack>
  );
};
