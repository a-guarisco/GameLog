import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SocialView from '@gamelog/social/social-view/SocialView';
import {
  useGetFriendList,
  useSearchUsers,
  useGetFriendRecommendations,
} from '@gamelog/api-manager/useApi';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/useApi');
jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/game/HeaderGameImage', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ appid }: any) => <View testID="social-header-image" appid={appid} />,
  };
});

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

const mockUseGetFriendList = useGetFriendList as jest.Mock;
const mockUseSearchUsers = useSearchUsers as jest.Mock;
const mockUseGetFriendRecommendations = useGetFriendRecommendations as jest.Mock;
const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

describe('SocialView', () => {
  const mockFriendList = [
    {
      user: { id: 'u1', username: 'Alice', steam_id: '1111' },
      friendship: { friendship_id: 'f1', friendship_status: 'accepted' },
    },
    {
      user: { id: 'u2', username: 'Bob', steam_id: '2222' },
      friendship: {
        friendship_id: 'f2',
        friendship_status: 'pending_incoming',
        friendship_requester_id: 'u2',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetFriendList.mockReturnValue({
      friendList: mockFriendList,
      isLoadingFriendList: false,
      errorFriendList: null,
      errorMessageFriendList: null,
      refetchFriendList: jest.fn(),
    });

    mockUseSearchUsers.mockReturnValue({
      searchResults: [],
      isLoadingSearch: false,
      errorSearch: null,
      errorMessageSearch: null,
      refetchSearch: jest.fn(),
    });

    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });
  });

  it('renders the Social Hub title and tab buttons', () => {
    render(<SocialView />);
    expect(screen.getByText('Social Hub')).toBeTruthy();
    expect(screen.getByTestId('friends-tab-btn')).toBeTruthy();
    expect(screen.getByTestId('search-tab-btn')).toBeTruthy();
  });

  it('displays pending requests and accepted friends in the Friends tab', () => {
    render(<SocialView />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByTestId('accept-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('refuse-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('recommend-btn-u1')).toBeTruthy();
  });

  it('allows accepting a friend request', async () => {
    mockApiManager.respondToFriend.mockResolvedValueOnce({
      message: 'Friend request accepted',
    } as any);
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('accept-btn-u2'));

    await waitFor(() => {
      expect(mockApiManager.respondToFriend).toHaveBeenCalledWith('f2', 'ACCEPTED');
    });
  });

  it('switches to Search tab and performs user search', async () => {
    mockUseSearchUsers.mockReturnValue({
      searchResults: [
        {
          user: { id: 'u3', username: 'Charlie', steam_id: '3333' },
          friendship: { friendship_status: null },
        },
      ],
      isLoadingSearch: false,
      errorSearch: null,
      errorMessageSearch: null,
      refetchSearch: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('search-tab-btn'));
    fireEvent.changeText(screen.getByTestId('user-search-input'), 'Charlie');

    expect(screen.getByText('Charlie')).toBeTruthy();
    expect(screen.getByTestId('add-friend-btn-u3')).toBeTruthy();
  });

  it('allows sending a friend request to a searched user', async () => {
    mockUseSearchUsers.mockReturnValue({
      searchResults: [
        {
          user: { id: 'u3', username: 'Charlie', steam_id: '3333' },
          friendship: { friendship_status: null },
        },
      ],
      isLoadingSearch: false,
      errorSearch: null,
      errorMessageSearch: null,
      refetchSearch: jest.fn(),
    });
    mockApiManager.addFriend.mockResolvedValueOnce({
      message: 'Friend request sent',
      friendship_id: 'f3',
    } as any);

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('search-tab-btn'));
    fireEvent.changeText(screen.getByTestId('user-search-input'), 'Charlie');
    fireEvent.press(screen.getByTestId('add-friend-btn-u3'));

    await waitFor(() => {
      expect(mockApiManager.addFriend).toHaveBeenCalledWith('u3');
    });
  });

  it('opens recommendations modal when clicking Recommend on a friend', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: {
        common_games: [{ gameSteamId: '730', requester_play_time: 1200, friend_play_time: 600 }],
        common_genres: [{ id: '1', description: 'Action' }],
        top_games: [{ gameSteamId: '570', keys: [] }],
      },
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));

    expect(screen.getByText('Recommendations')).toBeTruthy();
    expect(screen.getByText('Shared Genres')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();
  });

  it('closes recommendations modal when clicking outside the card on the backdrop', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));
    expect(screen.getByText('Recommendations')).toBeTruthy();

    fireEvent.press(screen.getByTestId('recommendations-modal-backdrop'));
    expect(screen.queryByText('Recommendations')).toBeNull();
  });

  it('closes recommendations modal when clicking the Close button', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));
    expect(screen.getByText('Recommendations')).toBeTruthy();

    fireEvent.press(screen.getByTestId('close-recommendations-btn'));
    expect(screen.queryByText('Recommendations')).toBeNull();
  });

  it('does not close recommendations modal when clicking inside the pop-up card', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: null,
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));
    expect(screen.getByText('Recommendations')).toBeTruthy();

    fireEvent.press(screen.getByText('Recommendations'));
    expect(screen.getByText('Recommendations')).toBeTruthy();
  });

  it('navigates to GameView when clicking a common game in recommendations modal', () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: {
        common_games: [{ gameSteamId: '730', requester_play_time: 1200, friend_play_time: 600 }],
        common_genres: [],
        top_games: [],
      },
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
    });

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));
    expect(screen.getByText('Recommendations')).toBeTruthy();
    expect(screen.getByText('App ID: 730')).toBeTruthy();

    fireEvent.press(screen.getByTestId('common-game-item-730'));

    expect(screen.queryByText('Recommendations')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('GameList', {
      screen: 'Game',
      params: {
        gameItem: expect.objectContaining({
          appid: '730',
          name: 'App ID: 730',
        }),
      },
    });
  });

  it('fetches game name via getGameBasicInfo and displays it in recommendations modal', async () => {
    mockUseGetFriendRecommendations.mockReturnValue({
      recommendations: {
        common_games: [{ gameSteamId: '730', requester_play_time: 1200, friend_play_time: 600 }],
        common_genres: [],
        top_games: [{ gameSteamId: '570', keys: [] }],
      },
      isLoadingRecommendations: false,
      errorRecommendations: null,
      errorMessageRecommendations: null,
      refetchRecommendations: jest.fn(),
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

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('recommend-btn-u1'));

    await waitFor(() => {
      expect(screen.getByText('Counter-Strike 2')).toBeTruthy();
      expect(screen.getByText('Dota 2')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('common-game-item-730'));

    expect(mockNavigate).toHaveBeenCalledWith('GameList', {
      screen: 'Game',
      params: {
        gameItem: expect.objectContaining({
          appid: '730',
          name: 'Counter-Strike 2',
        }),
      },
    });
  });
});
