import { render, fireEvent } from '@testing-library/react-native';
import { FriendRecommendationsSearcher } from '@gamelog/social/social-view/recommendations/FriendRecommendationsSearcher';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('FriendRecommendationsSearcher', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  const mockFriends: any = [
    {
      user: { id: 'u1', username: 'Alex', steam_id: '76561198000000001' },
      friendship_id: 'f1',
      status: 'ACCEPTED',
    },
    {
      user: { id: 'u2', username: 'Bob', steam_id: '76561198000000002' },
      friendship_id: 'f2',
      status: 'ACCEPTED',
    },
  ];

  it('renders LoadingBox when isLoading is true', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery=""
        onSearchQueryChange={jest.fn()}
        filteredFriends={[]}
        totalFriendsCount={0}
        isLoading={true}
        error={null}
        onSelectFriend={jest.fn()}
      />
    );

    expect(getByText('Loading friends...')).toBeTruthy();
  });

  it('renders ErrorBox when error occurs', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery=""
        onSearchQueryChange={jest.fn()}
        filteredFriends={[]}
        totalFriendsCount={2}
        isLoading={false}
        error={new Error('Error')}
        errorMessage="Custom error occurred"
        onSelectFriend={jest.fn()}
      />
    );

    expect(getByText('Custom error occurred')).toBeTruthy();
  });

  it('renders default error message if errorMessage is not provided', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery=""
        onSearchQueryChange={jest.fn()}
        filteredFriends={[]}
        totalFriendsCount={2}
        isLoading={false}
        error={new Error('Error')}
        onSelectFriend={jest.fn()}
      />
    );

    expect(getByText('Failed to load friends list.')).toBeTruthy();
  });

  it('renders empty friends InfoBox when totalFriendsCount is 0', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery=""
        onSearchQueryChange={jest.fn()}
        filteredFriends={[]}
        totalFriendsCount={0}
        isLoading={false}
        error={null}
        onSelectFriend={jest.fn()}
      />
    );

    expect(
      getByText(
        /You don't have any friends added yet. Add friends from the Social tab to compare recommendations!/
      )
    ).toBeTruthy();
  });

  it('renders list of matching friends and handles selection', () => {
    const onSelectFriend = jest.fn();
    const onSearchQueryChange = jest.fn();

    const { getByText, getByTestId } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        filteredFriends={mockFriends}
        totalFriendsCount={2}
        isLoading={false}
        error={null}
        onSelectFriend={onSelectFriend}
      />
    );

    expect(getByText('Select a Friend (2)')).toBeTruthy();
    expect(getByText('Alex')).toBeTruthy();
    expect(getByText('Bob')).toBeTruthy();

    fireEvent.press(getByTestId('select-friend-item-u1'));
    expect(onSelectFriend).toHaveBeenCalledWith(mockFriends[0]);

    fireEvent.press(getByTestId('compare-friend-btn-u2'));
    expect(onSelectFriend).toHaveBeenCalledWith(mockFriends[1]);

    fireEvent.changeText(getByTestId('friend-search-input'), 'Al');
    expect(onSearchQueryChange).toHaveBeenCalledWith('Al');
  });

  it('renders no results message when filter produces 0 items', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsSearcher
        searchQuery="Charlie"
        onSearchQueryChange={jest.fn()}
        filteredFriends={[]}
        totalFriendsCount={2}
        isLoading={false}
        error={null}
        onSelectFriend={jest.fn()}
      />
    );

    expect(getByText('Matching Friends (0)')).toBeTruthy();
    expect(getByText('No friends found matching "Charlie".')).toBeTruthy();
  });
});
