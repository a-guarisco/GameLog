import { Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText, ReportCtaButton } from '@gamelog/common/button';
import SectionCard from '@gamelog/common/SectionCard';
import { DateSelectorText, ContextText } from '@gamelog/common/typography/CardTypography';
import { LoadingBox, ErrorBox } from '@gamelog/common/feedbacks';

interface ReportRetrievalCardProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  yesterday: Date;
  loading: boolean;
  error: string | null;
  showStart: boolean;
  showEnd: boolean;
  setShowStart: (v: boolean) => void;
  setShowEnd: (v: boolean) => void;
  onStartChange: (event: any, selectedDate?: Date) => void;
  onEndChange: (event: any, selectedDate?: Date) => void;
  handleFetchReport: () => void;
  handleClearDates: () => void;
  formatDate: (d?: Date) => string;
  hasReport: boolean;
  className?: string;
  style?: any;
}

const ReportRetrievalCard = ({
  startDate,
  endDate,
  yesterday,
  loading,
  error,
  showStart,
  showEnd,
  setShowStart,
  setShowEnd,
  onStartChange,
  onEndChange,
  handleFetchReport,
  handleClearDates,
  formatDate,
  hasReport,
  className = '',
  style,
}: ReportRetrievalCardProps) => {
  const effectiveEnd = endDate || yesterday;
  const effectiveStart =
    startDate ||
    (() => {
      const d = new Date(effectiveEnd);
      d.setDate(d.getDate() - 13);
      return d;
    })();

  // Calculate dynamic text info
  const getDynamicInfoText = () => {
    if (!startDate && !endDate) {
      return 'Generates a report for the last 14 days.';
    }
    if (startDate && !endDate) {
      const diffDays = Math.max(
        1,
        Math.ceil((yesterday.getTime() - startDate.getTime()) / 86400000) + 1
      );
      if (diffDays % 7 === 0) {
        const weeks = diffDays / 7;
        return `Report starting ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago.`;
      }
      return `Report starting ${diffDays} days ago.`;
    }
    if (!startDate && endDate) {
      return 'Duration: 14 days.';
    }

    // Both start and end defined
    if (startDate && endDate) {
      const diffDays = Math.max(
        1,
        Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1
      );
      return `Duration: ${diffDays} days.`;
    }

    return 'Custom range selected.';
  };

  const isFill = className.includes('flex-1') || className.includes('h-full');

  return (
    <SectionCard
      testID="report-retrieval-card"
      label="Report Retrieval"
      className={className}
      style={style}
      headerRight={
        !!startDate || !!endDate || hasReport ? (
          <Button
            variant="ghost"
            action="primary"
            size="xs"
            onPress={handleClearDates}
            testID="report-reset-btn"
          >
            <ButtonText className="text-sm font-bold text-primary-500">Reset</ButtonText>
          </Button>
        ) : null
      }
    >
      <VStack space="md" className={`w-full ${isFill ? 'flex-1 justify-center' : ''}`}>
        <HStack space="md" className="justify-center pt-2">
          <VStack space="xs" className="items-center flex-1">
            <Text size="xs" className="font-medium text-typography-400">
              From
            </Text>
            <Pressable
              onPress={() => setShowStart(true)}
              hitSlop={12}
              testID="report-start-date-btn"
            >
              <DateSelectorText>{formatDate(effectiveStart)}</DateSelectorText>
            </Pressable>
          </VStack>

          <VStack space="xs" className="items-center flex-1">
            <Text size="xs" className="font-medium text-typography-400">
              To
            </Text>
            <Pressable onPress={() => setShowEnd(true)} hitSlop={12} testID="report-end-date-btn">
              <DateSelectorText>{formatDate(effectiveEnd)}</DateSelectorText>
            </Pressable>
          </VStack>
        </HStack>

        <ReportCtaButton
          onPress={handleFetchReport}
          isLoading={loading}
          className="mt-2"
          testID="generate-report-btn"
        />

        <ContextText className="text-center mt-2">{getDynamicInfoText()}</ContextText>

        {showStart && (
          <DateTimePicker
            value={effectiveStart}
            mode="date"
            display="default"
            onChange={onStartChange}
            maximumDate={effectiveEnd}
          />
        )}

        {showEnd && (
          <DateTimePicker
            value={effectiveEnd}
            mode="date"
            display="default"
            onChange={onEndChange}
            maximumDate={yesterday}
          />
        )}

        {loading && <LoadingBox message="Fetching report..." />}
        {error && <ErrorBox errorMessage={error} />}
      </VStack>
    </SectionCard>
  );
};

export default ReportRetrievalCard;
