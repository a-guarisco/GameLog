import { useState, useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { FlatList, ScrollView } from 'react-native';
import GLRefreshControl from '@gamelog/common/GLRefreshControl';
import { GameListCard } from './GameListCard';
import { useGameList } from './useGameList';
import { ErrorBox, LoadingBox, InfoBox, WarningBox } from '@gamelog/common/feedbacks';
import { GameListControls } from './GameListControls';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNavRailOffset } from '@gamelog/common/navConstants';
import { Button, ButtonText } from '@gamelog/common/button';
import Ionicons from '@react-native-vector-icons/ionicons';
import type { GameListErrorCode } from './gameListErrorMessages';

import { getSteamId } from '@gamelog/api-manager/steamApiKey';

const API_KEY_ERROR_CODES = new Set<GameListErrorCode>([
  'gamelist/steam-api-key-missing',
  'gamelist/unauthorized',
]);

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const playerID = getSteamId();
  const { isLandscape, isTablet } = useOrientation();
  const insets = useSafeAreaInsets();
  const leftPadding = getNavRailOffset({ isLandscape, isTablet, insetsLeft: insets.left });

  const {
    processedGames,
    isLoading,
    error,
    errorCode,
    errorMessage,
    isEmpty,
    noResults,
    sortBy,
    handleSortChange,
    searchQuery,
    setSearchQuery,
    genreFilter,
    setGenreFilter,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    dateRangeFilter,
    setDateRangeFilter,
    allAvailableGenres,
    refetchAll,
  } = useGameList(playerID);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [refetchAll]);

  const numColumns = isTablet ? (isLandscape ? 4 : 3) : isLandscape ? 3 : 2;
  const itemWidthClass =
    numColumns === 4 ? 'w-1/4 p-1' : numColumns === 3 ? 'w-1/3 p-1' : 'w-1/2 p-1';

  return (
    <Box className="flex-1" style={{ paddingLeft: leftPadding }}>
      <GameListControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        allAvailableGenres={allAvailableGenres}
      />
      {isLoading ? (
        <LoadingBox className="flex-1" message="Loading games..." />
      ) : error ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flex: 1 }}
          refreshControl={<GLRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <ErrorBox
            className="flex-1"
            title={errorCode ? `Error: ${errorCode}` : undefined}
            errorMessage={errorMessage}
          />
          {errorCode && API_KEY_ERROR_CODES.has(errorCode) && (
            <Box className="items-center pb-8">
              <Button
                variant="outline"
                action="primary"
                onPress={() => navigation.navigate('DevTab')}
                className="flex-row items-center gap-2"
                testID="gamelist-go-to-settings-btn"
              >
                <Ionicons name="settings-outline" size={16} color="#93c5fd" />
                <ButtonText>Go to Settings</ButtonText>
              </Button>
            </Box>
          )}
        </ScrollView>
      ) : isEmpty ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flex: 1 }}
          refreshControl={<GLRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          <WarningBox className="flex-1" message="No games found." />
        </ScrollView>
      ) : noResults ? (
        <InfoBox className="flex-1" message={`No results found for "${searchQuery}".`} />
      ) : (
        <FlatList
          data={processedGames}
          renderItem={({ item }) => (
            <Box className={itemWidthClass}>
              <GameListCard
                gameItem={item}
                sortBy={sortBy}
                platformFilter={platformFilter}
                onPress={() => navigation.navigate('Game', { gameItem: item })}
              />
            </Box>
          )}
          keyExtractor={(item) => item.appid.toString()}
          key={`grid-${numColumns}`}
          numColumns={numColumns}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          refreshControl={<GLRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </Box>
  );
};

export default GameListView;
