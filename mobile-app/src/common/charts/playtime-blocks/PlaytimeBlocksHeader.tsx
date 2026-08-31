import { Dispatch, SetStateAction } from 'react';
import { Animated, StyleSheet, Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Icon, ChevronLeftIcon, ChevronRightIcon } from '@gamelog/common/gluestack/icon';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChartSummaryText,
  ChartContextText,
  ChartDateRangeText,
} from '@gamelog/common/typography/ChartTypography';
import { formatShortDate } from '@gamelog/utils/formatUtils';

export const ShimmerBox = ({ className, anim }: { className?: string; anim: Animated.Value }) => {
  return (
    <Box
      className={`overflow-hidden relative bg-typography-200 dark:bg-typography-800 ${className || ''}`}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              {
                translateX: anim.interpolate({
                  inputRange: [-1, 1],
                  outputRange: [-200, 200],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </Box>
  );
};

interface PlaytimeBlocksHeaderProps {
  isScrolling: boolean;
  shimmerAnim: Animated.Value;
  displayTotalLabel: string;
  displayPeakLabel: string | null;
  displayAvgLabel: string;
  trendRange: string;
  setWeekOffset: Dispatch<SetStateAction<number>>;
  baseLimitDate: string | null;
  summaryStartDate: number;
  summaryEndDate: number;
  weekOffset: number;
  trendDays: any[];
}

export const PlaytimeBlocksHeader = ({
  isScrolling,
  shimmerAnim,
  displayTotalLabel,
  displayPeakLabel,
  displayAvgLabel,
  trendRange,
  setWeekOffset,
  baseLimitDate,
  summaryStartDate,
  summaryEndDate,
  weekOffset,
  trendDays,
}: PlaytimeBlocksHeaderProps) => {
  return (
    <VStack className="w-full px-4 mb-4">
      <HStack className="w-full justify-between items-center flex-wrap">
        <HStack space="sm" className="items-baseline">
          {isScrolling ? (
            <ShimmerBox className="w-24 h-7 rounded-md" anim={shimmerAnim} />
          ) : (
            <ChartSummaryText>{displayTotalLabel}</ChartSummaryText>
          )}
        </HStack>

        <HStack space="sm" className="items-center">
          {trendRange === 'week' && (
            <Pressable
              onPress={() => setWeekOffset((prev) => prev - 1)}
              disabled={
                !!baseLimitDate && trendDays.length > 0 && trendDays[0].date <= baseLimitDate
              }
              style={{
                opacity:
                  !!baseLimitDate && trendDays.length > 0 && trendDays[0].date <= baseLimitDate
                    ? 0.3
                    : 1,
              }}
              className="w-12 h-12 items-center justify-center rounded-full active:bg-background-100"
            >
              <Icon as={ChevronLeftIcon} className="text-typography-500" />
            </Pressable>
          )}

          {isScrolling ? (
            <ShimmerBox className="w-24 h-5 rounded-md" anim={shimmerAnim} />
          ) : (
            <ChartDateRangeText>
              {formatShortDate(summaryStartDate)} - {formatShortDate(summaryEndDate)}
            </ChartDateRangeText>
          )}

          {trendRange === 'week' && (
            <Pressable
              onPress={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
              disabled={weekOffset >= 0}
              style={{ opacity: weekOffset >= 0 ? 0.3 : 1 }}
              className="w-12 h-12 items-center justify-center rounded-full active:bg-background-100"
            >
              <Icon as={ChevronRightIcon} className="text-typography-500" />
            </Pressable>
          )}
        </HStack>
      </HStack>

      <HStack>
        {!!displayPeakLabel && (
          <ChartContextText>
            peak {displayPeakLabel} · {displayAvgLabel}
          </ChartContextText>
        )}
      </HStack>
    </VStack>
  );
};
