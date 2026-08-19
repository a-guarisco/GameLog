import React, { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { ErrorBox, LoadingBox } from '@gamelog/common/feedbacks';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Image, Pressable } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { GLSegmentedControl } from '@gamelog/common/GLSegmentedControl';
import { useReport } from './useReport';
import { useReportSortOrder } from './useReportSortOrder';

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
  const [showDetails, setShowDetails] = useState(false);
  const { sortOrder, setSortOrder } = useReportSortOrder();

  React.useEffect(() => {
    // Automatically fetch default 14-day report on mount
    handleFetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d?: Date) => (d ? d.toLocaleDateString() : 'Select Date');

  const formatHours = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.round(minutes / 60);
    return `${hrs}h`;
  };

  const summaryStats = React.useMemo(() => {
    if (!report || !report.game_reports || report.game_reports.length === 0 || !appliedStartDate) return null;

    let totalPlaytime = 0;
    let topGamePlaytime = -1;
    let topGameId = '';

    report.game_reports.forEach((game) => {
      totalPlaytime += game.today_play_time;
      if (game.today_play_time > topGamePlaytime) {
        topGamePlaytime = game.today_play_time;
        topGameId = game.app_id;
      }
    });

    const totalGames = report.game_reports.length;
    const finalEndDate = appliedEndDate || new Date();
    // compute days difference, +1 to include both start and end dates
    const diffTime = Math.abs(finalEndDate.getTime() - appliedStartDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      totalPlaytime,
      topGamePlaytime,
      topGameId,
      totalGames,
      diffDays,
      formattedStart: formatDate(appliedStartDate),
      formattedEnd: formatDate(finalEndDate),
    };
  }, [report, appliedStartDate, appliedEndDate]);

  const sortedGameReports = React.useMemo(() => {
    if (!report || !report.game_reports) return [];
    return [...report.game_reports].sort((a, b) => {
      if (sortOrder === 'playtime') {
        return b.today_play_time - a.today_play_time;
      } else if (sortOrder === 'streak') {
        return b.streak - a.streak;
      } else {
        const nameA = gameNames[a.app_id] || `App ID: ${a.app_id}`;
        const nameB = gameNames[b.app_id] || `App ID: ${b.app_id}`;
        return nameA.localeCompare(nameB);
      }
    });
  }, [report, sortOrder, gameNames]);

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
    <Box className="w-full rounded-lg bg-background-100 p-4 shadow-sm mt-4">
      <VStack space="md">
        <HStack className="justify-between items-center">
          <Text className="text-xl font-bold text-black dark:text-white">Report Retrieval</Text>
          {(startDate || endDate) && (
            <Pressable onPress={handleClearDates}>
              <Text className="text-sm font-bold text-primary-500">Clear</Text>
            </Pressable>
          )}
        </HStack>

        <HStack space="md" className="justify-between">
          <VStack space="xs" className="flex-1">
            <Text className="text-sm font-medium text-black dark:text-white">From:</Text>
            <Button
              onPress={() => setShowStart(true)}
            >
              <ButtonText>{formatDate(startDate)}</ButtonText>
            </Button>
          </VStack>

          <VStack space="xs" className="flex-1">
            <Text className="text-sm font-medium text-black dark:text-white">To:</Text>
            <Button
              onPress={() => setShowEnd(true)}
            >
              <ButtonText>{formatDate(endDate)}</ButtonText>
            </Button>
          </VStack>
        </HStack>

        {(showStart || (Platform.OS === 'ios' && showStart)) && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onStartChange}
            maximumDate={new Date()}
          />
        )}

        {(showEnd || (Platform.OS === 'ios' && showEnd)) && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={onEndChange}
            maximumDate={new Date()}
          />
        )}

        <Button onPress={handleFetchReport} isDisabled={loading}>
          <ButtonText>{!startDate ? 'Generate Report (Last 14 days)' : 'Generate Report'}</ButtonText>
        </Button>

        {loading && <LoadingBox message="Fetching report..." />}
        {error && <ErrorBox errorMessage={error} />}

        {report && (
          <VStack space="sm" className="mt-4 border-t border-background-300 pt-4">
            <Text className="text-lg font-bold text-black dark:text-white">
              Report Summary
            </Text>
            {report.game_reports.length === 0 ? (
              <Text className="text-sm text-typography-500">
                No games played in this period.
              </Text>
            ) : summaryStats ? (
              <VStack space="md">
                <Box className="bg-background-200 p-4 rounded-lg shadow-sm border border-background-300">
                  <VStack space="xs">
                    <Text className="text-sm font-medium text-typography-500">
                      From {summaryStats.formattedStart} to {summaryStats.formattedEnd} ({summaryStats.diffDays} {summaryStats.diffDays === 1 ? 'day' : 'days'})
                    </Text>
                    
                    <HStack className="justify-between items-center mt-2">
                      <Text className="text-sm font-bold text-black dark:text-white">Total Playtime</Text>
                      <Text className="text-sm font-bold text-success-700">{formatHours(summaryStats.totalPlaytime)}</Text>
                    </HStack>
                    
                    <HStack className="justify-between items-center mt-2">
                      <Text className="text-sm font-bold text-black dark:text-white">Games Played</Text>
                      <Text className="text-sm font-bold text-info-700">{summaryStats.totalGames}</Text>
                    </HStack>

                    <VStack className="mt-2 pt-2 border-t border-background-300">
                      <Text className="text-xs font-bold text-typography-500 uppercase">Top Game</Text>
                      <HStack className="justify-between items-center mt-1">
                        <Text className="text-sm font-bold text-black dark:text-white flex-1 mr-2" numberOfLines={1}>
                          {gameNames[summaryStats.topGameId] || `App ID: ${summaryStats.topGameId}`}
                        </Text>
                        <Text className="text-sm font-bold text-success-700">{formatHours(summaryStats.topGamePlaytime)}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
                
                <Pressable onPress={() => setShowDetails(!showDetails)} className="self-center mt-2 py-2 px-4 rounded-full bg-background-200">
                  <Text className="text-sm font-bold text-primary-500">
                    {showDetails ? 'Hide details' : 'See details'}
                  </Text>
                </Pressable>

                {showDetails && (
                  <VStack space="sm" className="mt-2">
                    <Text className="text-md font-bold text-black dark:text-white mb-2">
                      Game by Game Breakdown
                    </Text>
                    <GLSegmentedControl
                      options={[
                        { id: 'playtime', label: 'Playtime' },
                        { id: 'streak', label: 'Streak' },
                        { id: 'alpha', label: 'A-Z' },
                      ]}
                      activeId={sortOrder}
                      onSelect={(id) => setSortOrder(id as any)}
                      className="mb-2"
                    />
                    {sortedGameReports.map((game) => (
                      <Pressable
                        key={game.app_id}
                        testID="game-list-item"
                        onPress={() => handleGamePress(game.app_id, game.today_play_time)}
                      >
                        <Box className="relative overflow-hidden rounded-lg mb-2 bg-background-200 shadow-md">
                          <HStack space="md" className="px-3 py-3 items-center">
                            <Image
                              source={{ uri: steamAssetUrls.getGameCapsuleImage(game.app_id) }}
                              className="w-16 h-16 rounded-md bg-background-300 shrink-0"
                              resizeMode="cover"
                            />
                            <VStack className="flex-1">
                              <Text size="sm" className="font-bold uppercase text-black dark:text-white" numberOfLines={1}>
                                {gameNames[game.app_id] || `App ID: ${game.app_id}`}
                              </Text>
                              <HStack space="md" className="mt-0.5">
                                <Text size="xs" className="font-medium text-gray-600 dark:text-gray-400">
                                  Playtime:{' '}
                                  <Text size="xs" className="font-bold text-success-700">
                                    {formatHours(game.today_play_time)}
                                  </Text>
                                </Text>
                                <Text size="xs" className="font-medium text-gray-600 dark:text-gray-400">
                                  Streak:{' '}
                                  <Text size="xs" className="font-bold text-warning-700">
                                    {game.streak} days
                                  </Text>
                                </Text>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      </Pressable>
                    ))}
                  </VStack>
                )}
              </VStack>
            ) : null}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};
