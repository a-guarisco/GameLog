import { useState } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
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

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const { sortOrder, setSortOrder } = useReportSortOrder();

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
};
