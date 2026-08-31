import { render, fireEvent } from '@testing-library/react-native';
import { FriendsTabContent } from '@gamelog/social/social-view/FriendsTabContent';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('FriendsTabContent', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  const mockPending: any = [
    {
      user: { id: 'u1', username: 'PendingUser', steam_id: '76561198000000001' },
      friendship_id: 'f1',
      status: 'PENDING_INCOMING',
    },
  ];

  const mockAccepted: any = [
    {
      user: { id: 'u2', username: 'AcceptedFriend', steam_id: '76561198000000002' },
      friendship_id: 'f2',
      status: 'ACCEPTED',
    },
  ];

  it('renders LoadingBox when isLoading is true', () => {
    const { getByText } = renderWithProvider(
      <FriendsTabContent
        isLoading={true}
        error={false}
        pendingRequests={[]}
        acceptedFriends={[]}
        handlers={{}}
      />
    );

    expect(getByText('Loading friends...')).toBeTruthy();
  });

  it('renders ErrorBox when error is true', () => {
    const { getByText } = renderWithProvider(
      <FriendsTabContent
        isLoading={false}
        error={true}
        errorMessage="Failed loading friends"
        pendingRequests={[]}
        acceptedFriends={[]}
        handlers={{}}
      />
    );

    expect(getByText('Failed loading friends')).toBeTruthy();
  });

  it('renders empty accepted friends info message', () => {
    const { getByText } = renderWithProvider(
      <FriendsTabContent
        isLoading={false}
        error={false}
        pendingRequests={[]}
        acceptedFriends={[]}
        handlers={{}}
      />
    );

    expect(getByText(/You don't have any friends added yet/)).toBeTruthy();
  });

  it('renders pending requests and accepted friends correctly', () => {
    const onAcceptFriend = jest.fn();
    const onRefuseFriend = jest.fn();
    const onSelectRecommendations = jest.fn();

    const { getByText, getByTestId } = renderWithProvider(
      <FriendsTabContent
        isLoading={false}
        error={false}
        pendingRequests={mockPending}
        acceptedFriends={mockAccepted}
        handlers={{ onAcceptFriend, onRefuseFriend, onSelectRecommendations }}
      />
    );

    expect(getByText('Pending Friend Requests (1)')).toBeTruthy();
    expect(getByText('Friends (1)')).toBeTruthy();
    expect(getByText('PendingUser')).toBeTruthy();
    expect(getByText('AcceptedFriend')).toBeTruthy();
  });
});
