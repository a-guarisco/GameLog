import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { FlatList } from 'react-native';
import { GameListCard } from './GameListCard';
import { useGameList } from './useGameList';
import { ErrorBox, LoadingBox, InfoBox, WarningBox } from '@gamelog/common/feedbacks';
import { GameListControls } from './GameListControls';
import { useOrientation } from '@gamelog/common/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSteamId } from '@gamelog/api-manager/steamApiKey';

const GameListView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const playerID = getSteamId();
  const { isLandscape } = useOrientation();
  const insets = useSafeAreaInsets();
  const leftPadding = isLandscape ? insets.left + 74 : 0;

  const {
    processedGames,
    isLoading,
    error,
    errorMessage,
    isEmpty,
    noResults,
    sortBy,
    handleSortChange,
    searchQuery,
    setSearchQuery,
    genreFilter,
    setGenreFilter,
    platformFilter,
    setPlatformFilter,
    dateRangeFilter,
    setDateRangeFilter,
    allAvailableGenres,
  } = useGameList(playerID);

  return (
    <Box className="flex-1" style={{ paddingLeft: leftPadding }}>
      <GameListControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        allAvailableGenres={allAvailableGenres}
      />
      {isLoading ? (
        <LoadingBox className="flex-1" message="Loading games..." />
      ) : error ? (
        <ErrorBox className="flex-1" errorMessage={errorMessage} />
      ) : isEmpty ? (
        <WarningBox className="flex-1" message="No games found." />
      ) : noResults ? (
        <InfoBox className="flex-1" message={`No results found for "${searchQuery}".`} />
      ) : (
        <FlatList
          data={processedGames}
          renderItem={({ item }) => (
            <Box className={isLandscape ? 'w-1/3 p-1' : 'w-1/2 p-1'}>
              <GameListCard
                gameItem={item}
                onPress={() => navigation.navigate('Game', { gameItem: item })}
              />
            </Box>
          )}
          keyExtractor={(item) => item.appid.toString()}
          key={isLandscape ? 'grid-3' : 'grid-2'}
          numColumns={isLandscape ? 3 : 2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </Box>
  );
};

export default GameListView;
