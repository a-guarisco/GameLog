import { useState } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import { useOrientation } from '@gamelog/common/useOrientation';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReport } from './useReport';
import { useReportSortOrder } from './useReportSortOrder';
import { useReportStats } from './useReportStats';
import ReportRetrievalCard from './ReportRetrievalCard';
import ReportResultsCard from './ReportResultsCard';

export const ReportBox = () => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    appliedStartDate,
    appliedEndDate,
    loading,
    error,
    report,
    gameNames,
    handleFetchReport,
    handleClearDates,
  } = useReport();

  const { isLandscape } = useOrientation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const { sortOrder, setSortOrder } = useReportSortOrder();
  const [unexpandedReportHeight, setUnexpandedReportHeight] = useState<number | undefined>(
    undefined
  );
  const [retrievalInitialHeight, setRetrievalInitialHeight] = useState<number | undefined>(
    undefined
  );

  const { summary, sortedGameReports } = useReportStats(
    report,
    appliedStartDate,
    appliedEndDate,
    sortOrder,
    gameNames
  );

  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDateHelper = (d: Date) => {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStart(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEnd(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onResetPress = () => {
    setUnexpandedReportHeight(undefined);
    setRetrievalInitialHeight(undefined);
    handleClearDates();
  };

  const handleGamePress = (appId: string, playTime: number) => {
    const displayName = gameNames[appId] || `App ID: ${appId}`;
    navigation.navigate('GameListTab', {
      screen: 'Game',
      params: {
        gameItem: {
          appid: appId,
          name: displayName,
          playtime_forever: playTime || 0,
        },
      },
    });
  };

  if (!isLandscape) {
    return (
      <VStack space="xl" className="w-full">
        <ReportRetrievalCard
          startDate={startDate}
          endDate={endDate}
          yesterday={yesterday}
          loading={loading}
          error={error}
          showStart={showStart}
          showEnd={showEnd}
          setShowStart={setShowStart}
          setShowEnd={setShowEnd}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          handleFetchReport={handleFetchReport}
          handleClearDates={handleClearDates}
          formatDate={formatDateHelper}
          hasReport={!!report}
        />

        {report && (
          <ReportResultsCard
            report={report}
            summary={summary}
            sortedGameReports={sortedGameReports}
            gameNames={gameNames}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            handleGamePress={handleGamePress}
          />
        )}
      </VStack>
    );
  }

  const activeRetrievalHeight = report ? unexpandedReportHeight : undefined;

  return (
    <HStack space="md" className="w-full items-start">
      <Box
        testID="retrieval-wrapper"
        className="w-[40%]"
        style={activeRetrievalHeight ? { minHeight: activeRetrievalHeight } : undefined}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0 && !report && retrievalInitialHeight !== h) {
            setRetrievalInitialHeight(h);
          }
        }}
      >
        <ReportRetrievalCard
          startDate={startDate}
          endDate={endDate}
          yesterday={yesterday}
          loading={loading}
          error={error}
          showStart={showStart}
          showEnd={showEnd}
          setShowStart={setShowStart}
          setShowEnd={setShowEnd}
          onStartChange={onStartChange}
          onEndChange={onEndChange}
          handleFetchReport={handleFetchReport}
          handleClearDates={onResetPress}
          formatDate={formatDateHelper}
          hasReport={!!report}
          className="flex-1"
        />
      </Box>

      <Box
        className="w-[60%] flex-1"
        style={!report && retrievalInitialHeight ? { minHeight: retrievalInitialHeight } : undefined}
      >
        {report ? (
          <ReportResultsCard
            report={report}
            summary={summary}
            sortedGameReports={sortedGameReports}
            gameNames={gameNames}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            handleGamePress={handleGamePress}
            onUnexpandedLayout={(h) => {
              if (unexpandedReportHeight !== h) {
                setUnexpandedReportHeight(h);
              }
            }}
          />
        ) : (
          <SectionCard
            testID="report-empty-card"
            label="Report"
            className={retrievalInitialHeight ? 'flex-1' : ''}
          >
            <Box className="py-8 items-center justify-center w-full flex-1">
              <Text className="text-typography-400 text-center">
                Select a date range on the left and tap Generate Report to view your playtime summary.
              </Text>
            </Box>
          </SectionCard>
        )}
      </Box>
    </HStack>
  );
};
