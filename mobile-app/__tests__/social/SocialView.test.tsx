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

  it('renders the Social Hub title, stats, recommender card and tab buttons', () => {
    render(<SocialView />);
    expect(screen.getByText('Social Hub')).toBeTruthy();
    expect(screen.getByText('Friends')).toBeTruthy();
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Game Recommender')).toBeTruthy();
    expect(screen.getByTestId('social-tab-friends')).toBeTruthy();
    expect(screen.getByTestId('social-tab-search')).toBeTruthy();
  });

  it('displays pending requests and accepted friends in the Friends tab without recommend button', () => {
    render(<SocialView />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByTestId('accept-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('refuse-btn-u2')).toBeTruthy();
    expect(screen.queryByTestId('recommend-btn-u1')).toBeNull();
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

    fireEvent.press(screen.getByTestId('social-tab-search'));
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

    fireEvent.press(screen.getByTestId('social-tab-search'));
    fireEvent.changeText(screen.getByTestId('user-search-input'), 'Charlie');
    fireEvent.press(screen.getByTestId('add-friend-btn-u3'));

    await waitFor(() => {
      expect(mockApiManager.addFriend).toHaveBeenCalledWith('u3');
    });
  });

  it('navigates to FriendRecommendations screen when clicking the Recommender summary card', () => {
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('social-recommender-card'));

    expect(mockNavigate).toHaveBeenCalledWith('FriendRecommendations', {
      friendItem: undefined,
    });
  });
});
