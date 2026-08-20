import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import SectionState from '@gamelog/common/SectionState';
import type { PlaytimeTrend } from './playtimeTrendSelectors';

/** TODO: Make this dynamic based on the available space. */
const PLOT_HEIGHT = 96;
const MIN_BAR_PERCENT = 6;

interface ProfilePlaytimeTrendProps {
  trend: PlaytimeTrend;
  hasError?: boolean;
}

const TrendBar = ({
  percent,
  isToday,
  testID,
}: {
  percent: number;
  isToday: boolean;
  testID: string;
}) => {
  if (percent <= 0) {
    return <Box testID={testID} className="h-0.5 w-full rounded-full bg-background-300" />;
  }

  return (
    <Box
      testID={testID}
      className={`w-full rounded-t-md ${isToday ? 'bg-primary-300' : 'bg-primary-400'}`}
      style={{ height: `${Math.min(100, Math.max(MIN_BAR_PERCENT, percent))}%` }}
    />
  );
};

const ProfilePlaytimeTrend = ({ trend, hasError = false }: ProfilePlaytimeTrendProps) => (
  <SectionCard label={`Playtime · last ${trend.days.length} days`} testID="profile-playtime-trend">
    <SectionState
      hasError={hasError}
      isEmpty={!trend.hasPlaytime}
      errorMessage="Could not load playtime history"
      emptyMessage="No playtime in this window"
    />

    {!hasError && trend.hasPlaytime && (
      <VStack space="sm">
        <HStack space="sm" className="items-baseline">
          <Text size="xl" className="font-bold text-typography-0">
            {trend.totalLabel}
          </Text>
          {!!trend.peakLabel && (
            <Text size="xs" className="text-typography-300">
              peak {trend.peakLabel}
            </Text>
          )}
        </HStack>

        <HStack space="xs" className="items-end" style={{ height: PLOT_HEIGHT }}>
          {trend.days.map((day) => (
            <Box
              key={day.date}
              className="h-full flex-1 justify-end"
              accessibilityLabel={day.accessibilityLabel}
            >
              <TrendBar
                percent={day.percentOfPeak}
                isToday={day.isToday}
                testID={`profile-trend-bar-${day.date}`}
              />
            </Box>
          ))}
        </HStack>

        <HStack space="xs">
          {trend.days.map((day) => (
            <Text
              key={day.date}
              size="2xs"
              className={`flex-1 text-center font-bold ${
                day.isToday ? 'text-typography-100' : 'text-typography-400'
              }`}
            >
              {day.label}
            </Text>
          ))}
        </HStack>

        <Text size="xs" className="text-typography-300">
          Played {trend.activeDaysLabel}.
        </Text>
      </VStack>
    )}
  </SectionCard>
);

export default ProfilePlaytimeTrend;
