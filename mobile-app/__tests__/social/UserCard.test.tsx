import { render, screen, fireEvent } from '@testing-library/react-native';
import { UserCard } from '@gamelog/social/user-card/UserCard';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import type { UserSearchResult } from '@gamelog/api-manager/dto';

const renderWithProvider = (component: React.ReactElement) =>
  render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

describe('UserCard', () => {
  const baseItem: UserSearchResult = {
    user: {
      id: 'u-1',
      firebase_uid: 'fb-1',
      username: 'GamerOne',
      steam_id: '76561198000000001',
      has_steam_api_key: false,
    },
    friendship: {
      friendship_status: 'accepted',
    },
  };

  it('renders user card with friend status and avatar image when avatarUrl is provided', () => {
    renderWithProvider(
      <UserCard
        item={baseItem}
        avatarUrl="https://example.com/avatar.jpg"
      />
    );

    expect(screen.getByText('GamerOne')).toBeTruthy();
    expect(screen.getByText('Friend')).toBeTruthy();
    expect(screen.getByTestId('user-avatar-image')).toBeTruthy();
  });

  it('renders with pending incoming status (Pending)', () => {
    const item: UserSearchResult = {
      ...baseItem,
      friendship: { friendship_status: 'pending_incoming' },
    };

    renderWithProvider(<UserCard item={item} />);

    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders with pending outgoing status (Requested)', () => {
    const item: UserSearchResult = {
      ...baseItem,
      friendship: { friendship_status: 'pending_outgoing' },
    };

    renderWithProvider(<UserCard item={item} />);

    expect(screen.getByText('Requested')).toBeTruthy();
    expect(screen.getByTestId('user-avatar-fallback-text')).toBeTruthy();
  });

  it('renders with blocked status', () => {
    const item: UserSearchResult = {
      ...baseItem,
      friendship: { friendship_status: 'blocked' },
    };

    renderWithProvider(<UserCard item={item} />);

    expect(screen.getByText('Blocked')).toBeTruthy();
  });

  it('renders with default player status when status is null', () => {
    const item: UserSearchResult = {
      ...baseItem,
      friendship: { friendship_status: null },
    };

    renderWithProvider(<UserCard item={item} />);

    expect(screen.getByText('Player')).toBeTruthy();
  });

  it('handles card press when onSelectUser is provided and when omitted', () => {
    const onSelectUser = jest.fn();
    const { rerender } = renderWithProvider(
      <UserCard item={baseItem} onSelectUser={onSelectUser} />
    );

    fireEvent.press(screen.getByTestId('user-card-pressable-u-1'));
    expect(onSelectUser).toHaveBeenCalledWith(baseItem);

    // Re-render without onSelectUser and ensure press does not error
    rerender(
      <GluestackUIProvider mode="light">
        <UserCard item={baseItem} />
      </GluestackUIProvider>
    );

    expect(() => {
      fireEvent.press(screen.getByTestId('user-card-pressable-u-1'));
    }).not.toThrow();
  });
});
