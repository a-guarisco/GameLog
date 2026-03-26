import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text } from '@gamelog/components/ui/text';
import { Button, ButtonText } from '@gamelog/components/ui/button';
import { Box } from '@gamelog/components/ui/box';
import { FlatList } from 'react-native';
import { OwnedGames } from '@gamelog/api-manager/dto';
import { useGetOwnedGames } from '@gamelog/api-manager/useApi';
import { GameOverviewStatsCard } from './GameOverviewStatsCard';
import { useMemo, useState } from 'react';
import { Spinner } from '@gamelog/components/ui/spinner';

const GameListView = ({ route }: any) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  // const { playerID } = route.params as GameListProps;
  const playerID = '76561198159652025'; //FIX
  const { ownedGames, isLoadingOwnedGames, errorOwnedGames } = useGetOwnedGames(playerID, true);

  const [searchQuery /*setSearchQuery*/] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'playtime'>('playtime');
  const [isProcessing, setIsProcessing] = useState(false);

  const processedGames = useMemo(() => {
    if (!ownedGames?.response?.games) return [];

    let filtered = ownedGames.response.games.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'playtime') {
        return b.playtime_forever - a.playtime_forever;
      }
      return 0;
    });
  }, [ownedGames, searchQuery, sortBy]);

  const handleSortChange = (newSort: 'name' | 'playtime') => {
    setIsProcessing(true);
    setSortBy(newSort);

    setTimeout(() => {
      setIsProcessing(false);
    }, 200);
  };

  return (
    <Box className="flex-1">
      <Box className="p-4 gap-2">
        <Button onPress={() => handleSortChange(sortBy === 'name' ? 'playtime' : 'name')}>
          <ButtonText>Sort by: {sortBy}</ButtonText>
        </Button>
      </Box>
      {isProcessing || isLoadingOwnedGames ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="mt-2 text-typography-400">Loading...</Text>
        </Box>
      ) : errorOwnedGames ? (
        <Box className="flex-1 items-center justify-center">
          <Text className="text-lg text-error-500">
            Failed to load games. Please try again later.
          </Text>
        </Box>
      ) : !ownedGames || !ownedGames.response || ownedGames.response.games.length === 0 ? (
        <Box className="flex-1 items-center justify-center">
          <Text className="text-lg">No games found in your library.</Text>
        </Box>
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
