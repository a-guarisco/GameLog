import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SocialView from '@gamelog/social/social-view/SocialView';
import {
  useGetFriendList,
  useSearchUsers,
  useGetFriendRecommendations,
  useGetUserMe,
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
const mockUseGetUserMe = useGetUserMe as jest.Mock;
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

    mockUseGetUserMe.mockReturnValue({
      currentUser: { id: 'current-user-id', username: 'Me', steam_id: '0000' },
      isLoadingUserMe: false,
      errorUserMe: null,
      errorMessageUserMe: null,
      refetchUserMe: jest.fn(),
    });

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

  it('renders the Social Hub title, recommender card and tab buttons', () => {
    render(<SocialView />);
    expect(screen.getByText('Social Hub')).toBeTruthy();
    expect(screen.getByText('Game Recommender')).toBeTruthy();
    expect(screen.getByTestId('social-tab-friends')).toBeTruthy();
    expect(screen.getByTestId('social-tab-search')).toBeTruthy();
  });

  it('displays pending requests and accepted friends without steam id text', () => {
    render(<SocialView />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.queryByText(/Steam ID/)).toBeNull();
    expect(screen.getByTestId('accept-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('refuse-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('user-card-menu-btn-u2')).toBeTruthy();
    expect(screen.getByTestId('user-card-menu-btn-u1')).toBeTruthy();
  });

  it('allows accepting a friend request', async () => {
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'Friend request accepted',
    } as any);
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('accept-btn-u2'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('ACCEPT', 'f2');
    });
  });

  it('allows refusing a friend request', async () => {
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'Friend request rejected',
    } as any);
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('refuse-btn-u2'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('REJECT', 'f2');
    });
  });

  it('allows blocking a friend request after confirmation via menu and modal', async () => {
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'User blocked',
    } as any);
    render(<SocialView />);

    // Open 3-dot menu on Bob's card
    fireEvent.press(screen.getByTestId('user-card-menu-btn-u2'));

    // Press Block menu item
    fireEvent.press(screen.getByTestId('block-btn-u2'));

    // Confirm in custom modal
    expect(screen.getByTestId('block-friend-u2-confirm-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('block-friend-u2-confirm-btn'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('BLOCK', 'f2');
    });
  });

  it('allows removing an accepted friendship after confirmation via modal', async () => {
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'Friendship removed',
    } as any);
    render(<SocialView />);

    // Open 3-dot menu on Alice's card
    fireEvent.press(screen.getByTestId('user-card-menu-btn-u1'));

    // Press Remove Friend menu item
    fireEvent.press(screen.getByTestId('remove-friend-btn-u1'));

    // Confirm in modal
    expect(screen.getByTestId('remove-friend-u1-confirm-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('remove-friend-u1-confirm-btn'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('REMOVE', 'f1');
    });
  });

  it('allows blocking an accepted friend after confirmation via modal', async () => {
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'User blocked',
    } as any);
    render(<SocialView />);

    // Open 3-dot menu on Alice's card
    fireEvent.press(screen.getByTestId('user-card-menu-btn-u1'));

    // Press Block menu item
    fireEvent.press(screen.getByTestId('block-friend-btn-u1'));

    // Confirm in modal
    expect(screen.getByTestId('block-friend-u1-confirm-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('block-friend-u1-confirm-btn'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('BLOCK', 'f1');
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

  it('allows unblocking a blocked user from search results after confirmation via modal', async () => {
    mockUseSearchUsers.mockReturnValue({
      searchResults: [
        {
          user: { id: 'u5', username: 'Eve', steam_id: '5555' },
          friendship: {
            friendship_id: 'f5',
            friendship_status: 'blocked',
            friendship_requester_id: 'current-user-id',
          },
        },
      ],
      isLoadingSearch: false,
      errorSearch: null,
      errorMessageSearch: null,
      refetchSearch: jest.fn(),
    });
    mockApiManager.manageFriendship.mockResolvedValueOnce({
      message: 'User unblocked',
    } as any);

    render(<SocialView />);

    fireEvent.press(screen.getByTestId('social-tab-search'));
    fireEvent.changeText(screen.getByTestId('user-search-input'), 'Eve');

    expect(screen.getByText('Eve')).toBeTruthy();
    expect(screen.getByTestId('user-card-menu-btn-u5')).toBeTruthy();

    // Open menu
    fireEvent.press(screen.getByTestId('user-card-menu-btn-u5'));

    // Press Unblock in menu
    fireEvent.press(screen.getByTestId('unblock-btn-u5'));

    // Confirm in modal
    expect(screen.getByTestId('unblock-friend-u5-confirm-modal')).toBeTruthy();
    fireEvent.press(screen.getByTestId('unblock-friend-u5-confirm-btn'));

    await waitFor(() => {
      expect(mockApiManager.manageFriendship).toHaveBeenCalledWith('UNBLOCK', 'f5');
    });
  });

  it('navigates to FriendRecommendations screen when clicking the Recommender summary card', () => {
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('social-recommender-card'));

    expect(mockNavigate).toHaveBeenCalledWith('FriendRecommendations', {
      friendItem: undefined,
    });
  });

  it('navigates to OtherUserProfile screen when clicking a user card', () => {
    render(<SocialView />);

    fireEvent.press(screen.getByTestId('user-card-pressable-u1'));

    expect(mockNavigate).toHaveBeenCalledWith('OtherUserProfile', {
      item: mockFriendList[0],
      user: mockFriendList[0].user,
      friendship: mockFriendList[0].friendship,
    });
  });
});
