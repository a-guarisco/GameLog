import { render, fireEvent, act } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import GameListView from '@gamelog/game-list/GameListView';
import { useGameList } from '@gamelog/game-list/useGameList';
import { getSteamId } from '@gamelog/api-manager/steamApiKey';

jest.mock('@gamelog/game-list/useGameList');
jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamId: jest.fn(),
}));

jest.mock('@gamelog/common/gluestack/spinner', () => ({
  Spinner: 'Spinner',
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});
jest.mock('@react-navigation/native-stack', () => ({
  NativeStackNavigationProp: jest.fn(),
}));

const mockUseGameList = useGameList as jest.Mock;

describe('GameListView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSteamId as jest.Mock).mockReturnValue('123456789');
  });

  it('shows LoadingBox when isLoading is true', () => {
    mockUseGameList.mockReturnValue({
      isLoading: true,
      processedGames: [],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    expect(getSteamId).toHaveBeenCalled();
    expect(getByText('Loading games...')).toBeTruthy();
  });

  it('shows ErrorBox when there is an error', () => {
    const errorMsg = 'Network Error';
    mockUseGameList.mockReturnValue({
      isLoading: false,
      error: true,
      errorMessage: errorMsg,
      processedGames: [],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    expect(getByText('Error')).toBeTruthy();
    expect(getByText(errorMsg)).toBeTruthy();
  });

  it('shows InfoBox when the search does not produce results', () => {
    mockUseGameList.mockReturnValue({
      isLoading: false,
      noResults: true,
      searchQuery: 'Elden Ring',
      processedGames: [],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    expect(getByText(/No results found for "Elden Ring"/i)).toBeTruthy();
  });

  it('shows WarningBox when there are no games', () => {
    mockUseGameList.mockReturnValue({
      isLoading: false,
      isEmpty: true,
      processedGames: [],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    expect(getByText('No games found.')).toBeTruthy();
  });

  it('renders the list of games correctly', () => {
    mockUseGameList.mockReturnValue({
      isLoading: false,
      processedGames: [{ appid: 1, name: 'Portal', playtime_forever: 10 }],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    expect(getByText('10m')).toBeTruthy();
  });

  it('navigates to Game screen on game press', () => {
    mockUseGameList.mockReturnValue({
      isLoading: false,
      processedGames: [{ appid: 1, name: 'Portal', playtime_forever: 10 }],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
    });

    const { getByText } = render(<GameListView route={{}} />);
    fireEvent.press(getByText('10m'));

    expect(mockNavigate).toHaveBeenCalledWith('Game', {
      gameItem: { appid: 1, name: 'Portal', playtime_forever: 10 },
    });
  });

  it('triggers pull-to-refresh on FlatList', async () => {
    const mockRefetchAll = jest.fn().mockResolvedValue(undefined);
    mockUseGameList.mockReturnValue({
      isLoading: false,
      processedGames: [{ appid: 1, name: 'Portal', playtime_forever: 10 }],
      allAvailableGenres: [],
      dateRangeFilter: { from: undefined, to: undefined },
      refetchAll: mockRefetchAll,
    });

    const { UNSAFE_getByType } = render(<GameListView route={{}} />);
    const flatList = UNSAFE_getByType(FlatList);

    await act(async () => {
      flatList.props.onRefresh();
    });

    expect(mockRefetchAll).toHaveBeenCalledTimes(1);
  });
});
