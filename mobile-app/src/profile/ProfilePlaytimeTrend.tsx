import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import SectionState from '@gamelog/common/SectionState';
import type { PlaytimeTrend } from './playtimeTrendSelectors';

/** Plot height in px. Fixed so an idle week and a busy one occupy the same slot on the page. */
const PLOT_HEIGHT = 96;
/** Keeps a played-but-barely day visible instead of collapsing it into the axis. */
const MIN_BAR_PERCENT = 6;

interface ProfilePlaytimeTrendProps {
  trend: PlaytimeTrend;
  /** A failed series must not read as "you played nothing". */
  hasError?: boolean;
}

/** One bar's height is its share of the busiest day, so the tallest bar always fills the plot. */
const TrendBar = ({
  percent,
  isToday,
  testID,
}: {
  percent: number;
  isToday: boolean;
  testID: string;
}) => {
  // A day off is a flat tick on the axis, not a bar of height zero that reads as missing.
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

/**
 * Day-by-day playtime across the whole library, from the backend's own rolling snapshots.
 * Days the backend never reported are drawn as flat ticks rather than dropped, so the axis
 * stays a fixed window and a quiet week reads as a quiet week.
 */
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
