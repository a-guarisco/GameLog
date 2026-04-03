import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Box } from '@gamelog/common/gluestack/box';
import { FlatList } from 'react-native';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { GameOverviewStatsCard } from './GameOverviewStatsCard';
import { useGameList } from './useGameList';
import { ErrorBox, LoadingBox, InfoBox, WarningBox } from '@gamelog/common/feedbacks';
import { GameListControls } from './GameListControls';

const GameListView = ({ route }: any) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  // const { playerID } = route.params as GameListProps;
  const playerID = '76561198077919169'; //FIX
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
  } = useGameList(playerID);

  return (
    <Box className="flex-1">
      <GameListControls sortBy={sortBy} onSortChange={handleSortChange} />
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
          renderItem={({ item }: { item: OwnedGames['response']['games'][0] }) => (
            <Box className="w-1/2 p-1">
              <GameOverviewStatsCard
                gameItem={item}
                onPress={() => navigation.navigate('Game', { gameItem: item })}
              />
            </Box>
          )}
          keyExtractor={(item) => item.appid.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 20 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
        />
      )}
    </Box>
  );
};

export default GameListView;
