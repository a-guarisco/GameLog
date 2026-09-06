import { render, screen } from '@testing-library/react-native';
import OtherUserIdentity from '@gamelog/social/other-user-profile/OtherUserIdentity';

describe('OtherUserIdentity', () => {
  const mockUser = {
    id: 'user-1',
    firebase_uid: 'fb-1',
    username: 'TestUser',
    steam_id: '12345',
    has_steam_api_key: true,
  };

  const mockPlayer = {
    steamid: '12345',
    personaname: 'PersonaTest',
    avatarfull: 'https://example.com/avatar.jpg',
    timecreated: 1577836800,
  };

  it('renders correctly for friend status', () => {
    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'accepted' }}
      />
    );

    expect(screen.getByText('PersonaTest')).toBeTruthy();
    expect(screen.getByTestId('other-user-status-chip')).toBeTruthy();
    expect(screen.getByText('Friend')).toBeTruthy();
  });

  it('renders correctly for pending incoming status', () => {
    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'pending_incoming' }}
      />
    );

    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders correctly for pending outgoing status', () => {
    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'pending_outgoing' }}
      />
    );

    expect(screen.getByText('Requested')).toBeTruthy();
  });

  it('renders correctly for blocked status', () => {
    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'blocked' }}
      />
    );

    expect(screen.getByText('Blocked')).toBeTruthy();
  });

  it('renders three-dots menu button as the last element in row 1 across all statuses', () => {
    const onBlockFriend = jest.fn();
    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'accepted' }}
        onBlockFriend={onBlockFriend}
      />
    );

    expect(screen.getByTestId(`user-card-menu-btn-${mockUser.id}`)).toBeTruthy();
  });

  it('renders Accept and Refuse buttons only when pending_incoming with friendshipId and handlers', () => {
    const onAcceptFriend = jest.fn();
    const onRefuseFriend = jest.fn();

    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'pending_incoming' }}
        onAcceptFriend={onAcceptFriend}
        onRefuseFriend={onRefuseFriend}
      />
    );

    expect(screen.getByTestId(`accept-btn-${mockUser.id}`)).toBeTruthy();
    expect(screen.getByTestId(`refuse-btn-${mockUser.id}`)).toBeTruthy();
    expect(screen.getByText('Accept')).toBeTruthy();
    expect(screen.getByText('Refuse')).toBeTruthy();
  });

  it('does not render Accept or Refuse buttons when status is accepted', () => {
    const onAcceptFriend = jest.fn();
    const onRefuseFriend = jest.fn();

    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'accepted' }}
        onAcceptFriend={onAcceptFriend}
        onRefuseFriend={onRefuseFriend}
      />
    );

    expect(screen.queryByTestId(`accept-btn-${mockUser.id}`)).toBeNull();
    expect(screen.queryByTestId(`refuse-btn-${mockUser.id}`)).toBeNull();
  });

  it('does not render Accept or Refuse buttons when status is pending_outgoing', () => {
    const onAcceptFriend = jest.fn();
    const onRefuseFriend = jest.fn();

    render(
      <OtherUserIdentity
        user={mockUser}
        player={mockPlayer}
        friendship={{ friendship_id: 'f1', friendship_status: 'pending_outgoing' }}
        onAcceptFriend={onAcceptFriend}
        onRefuseFriend={onRefuseFriend}
      />
    );
    expect(screen.queryByTestId(`accept-btn-${mockUser.id}`)).toBeNull();
    expect(screen.queryByTestId(`refuse-btn-${mockUser.id}`)).toBeNull();
  });

  it('renders correctly when no friendship exists (Player status)', () => {
    render(<OtherUserIdentity user={mockUser} player={undefined} friendship={null} />);

    expect(screen.getByText('TestUser')).toBeTruthy();
    expect(screen.getByText('Player')).toBeTruthy();
  });
});
