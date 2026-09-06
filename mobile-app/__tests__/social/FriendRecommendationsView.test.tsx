import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import FriendRecommendationsView from '@gamelog/social/social-view/FriendRecommendationsView';
import { useGetFriendRecommendations, useGetFriendList } from '@gamelog/api-manager/useApi';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('@gamelog/api-manager/apiManager');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockRefetchFriendList = jest.fn().mockResolvedValue(undefined);
const mockRefetchRecommendations = jest.fn().mockResolvedValue(undefined);
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      canGoBack: () => true,
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

const mockUseGetFriendList = useGetFriendList as jest.Mock;
const mockUseGetFriendRecommendations = useGetFriendRecommendations as jest.Mock;
const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

describe('FriendRecommendationsView', () => {
  const mockFriendAlice = {
    user: {
      id: 'u1',
      username: 'Alice',
      steam_id: '1111',
      firebase_uid: 'fb1',
      has_steam_api_key: true,
    },
    friendship: { friendship_id: 'f1', friendship_status: 'accepted' },
  };

  const mockFriendBob = {
    user: {
      id: 'u2',
      username: 'Bob',
      steam_id: '2222',
      firebase_uid: 'fb2',
      has_steam_api_key: true,
    },
    friendship: { friendship_id: 'f2', friendship_status: 'accepted' },
  };

  const mockRecommendations = {
    common_games: [{ gameSteamId: '730', requester_play_time: 1200, friend_play_time: 600 }],
    common_genres: [{ id: '1', description: 'Action' }],
    top_games: [{ gameSteamId: '570', keys: [{ id: '2', description: 'Strategy' }] }],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetFriendList.mockReturnValue({
      friendList: [mockFriendAlice, mockFriendBob],
      isLoadingFriendList: false,
      refetchFriendList: mockRefetchFriendList,
    });

    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: mockRecommendations,
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: mockRefetchRecommendations,
    });

    mockApiManager.getGameBasicInfo.mockImplementation((appId: string) => {
      if (appId === '730') {
        return Promise.resolve({
          '730': { success: true, data: { name: 'Counter-Strike 2' } },
        } as any);
      }
      if (appId === '570') {
        return Promise.resolve({
          '570': { success: true, data: { name: 'Dota 2' } },
        } as any);
      }
      return Promise.resolve({} as any);
    });
  });

  it('renders friend searcher when opened without an initial friend', () => {
    render(<FriendRecommendationsView />);

    expect(screen.getByText('Game Recommender')).toBeTruthy();
    expect(screen.getByTestId('friend-search-input')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('selects a friend from searcher and displays recommendations with Change Friend button', async () => {
    render(<FriendRecommendationsView />);

    fireEvent.press(screen.getByTestId('compare-friend-btn-u1'));

    expect(screen.getByText('Active Friend')).toBeTruthy();
    expect(screen.getByTestId('search-another-friend-btn')).toBeTruthy();
    expect(screen.getByText('Shared Genres')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Counter-Strike 2')).toBeTruthy();
      expect(screen.getByText('Dota 2')).toBeTruthy();
    });
  });

  it('allows clicking Change Friend button to search for another friend', () => {
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);

    expect(screen.getByTestId('search-another-friend-btn')).toBeTruthy();

    fireEvent.press(screen.getByTestId('search-another-friend-btn'));

    expect(screen.getByTestId('friend-search-input')).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('friend-search-input'), 'Bob');

    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.queryByText('Alice')).toBeNull();

    fireEvent.press(screen.getByTestId('compare-friend-btn-u2'));

    expect(mockUseGetFriendRecommendations).toHaveBeenCalledWith('u2');
  });

  it('navigates to Game screen when pressing a common game', async () => {
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);

    await waitFor(() => {
      expect(screen.getByText('Counter-Strike 2')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('common-game-item-730'));

    expect(mockNavigate).toHaveBeenCalledWith('GameListTab', {
      screen: 'Game',
      params: {
        gameItem: expect.objectContaining({
          appid: '730',
          name: 'Counter-Strike 2',
          playtime_forever: 1200,
        }),
      },
    });
  });

  it('handles back button press', () => {
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);

    fireEvent.press(screen.getByTestId('recommendations-back-btn'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('opens steam store link when pressing top recommended game', async () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);

    await waitFor(() => {
      expect(screen.getByText('Dota 2')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Dota 2'));

    expect(openURLSpy).toHaveBeenCalledWith('https://store.steampowered.com/app/570');
  });

  it('shows loading, empty, and no-match states for friend selection', () => {
    mockUseGetFriendList.mockReturnValue({
      friendList: [],
      isLoadingFriendList: true,
      errorFriendList: null,
      errorMessageFriendList: null,
    });

    render(<FriendRecommendationsView />);
    expect(screen.getByText('Loading friends...')).toBeTruthy();

    mockUseGetFriendList.mockReturnValue({
      friendList: [],
      isLoadingFriendList: false,
      errorFriendList: null,
      errorMessageFriendList: null,
    });

    render(<FriendRecommendationsView />);
    expect(
      screen.getByText(
        "You don't have any friends added yet. Add friends from the Social tab to compare recommendations!"
      )
    ).toBeTruthy();

    mockUseGetFriendList.mockReturnValue({
      friendList: [mockFriendAlice, mockFriendBob],
      isLoadingFriendList: false,
      errorFriendList: null,
      errorMessageFriendList: null,
    });

    render(<FriendRecommendationsView />);
    fireEvent.changeText(screen.getByTestId('friend-search-input'), 'zzz');
    expect(screen.getByText('No friends found matching "zzz".')).toBeTruthy();
  });

  it('renders recommendation loading, error, and empty-data states', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: true,
      errorRecommendations: null,
      errorMessageRecommendations: null,
    });

    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);
    expect(screen.getByText('Analyzing games for Alice...')).toBeTruthy();

    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: false,
      errorRecommendations: new Error('failed'),
      errorMessageRecommendations: 'Recommendations failed to load',
    });

    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);
    expect(screen.getByText('Recommendations failed to load')).toBeTruthy();

    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: { common_games: [], common_genres: [], top_games: [] },
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
    });

    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);
    expect(screen.getByText('No recommendation data available with Alice.')).toBeTruthy();
  });

  it('handles back button when selecting friend with an active friend already set', () => {
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);
    // Press change friend
    fireEvent.press(screen.getByTestId('search-another-friend-btn'));
    expect(screen.getByTestId('friend-search-input')).toBeTruthy();

    // Now press back
    fireEvent.press(screen.getByTestId('recommendations-back-btn'));
    // Should return to active friend view without navigating back
    expect(screen.getByText('Comparing games and shared tastes with Alice')).toBeTruthy();
  });

  it('calls custom onClose callback when provided', () => {
    const onClose = jest.fn();
    render(<FriendRecommendationsView friendItem={mockFriendAlice} onClose={onClose} />);

    fireEvent.press(screen.getByTestId('recommendations-back-btn'));
    expect(onClose).toHaveBeenCalled();
  });

  it('triggers pull-to-refresh and refetches recommendations and friends when active friend is set', async () => {
    render(<FriendRecommendationsView friendItem={mockFriendAlice} />);

    const scrollView = screen.getByTestId('scrollable-page-scroll');

    await act(async () => {
      fireEvent(scrollView, 'refresh');
    });

    expect(mockRefetchRecommendations).toHaveBeenCalledTimes(1);
    expect(mockRefetchFriendList).toHaveBeenCalledTimes(1);
  });

  it('triggers pull-to-refresh and refetches friend list only when in friend selection mode', async () => {
    render(<FriendRecommendationsView />);

    const scrollView = screen.getByTestId('scrollable-page-scroll');

    await act(async () => {
      fireEvent(scrollView, 'refresh');
    });

    expect(mockRefetchFriendList).toHaveBeenCalledTimes(1);
    expect(mockRefetchRecommendations).not.toHaveBeenCalled();
  });
});
