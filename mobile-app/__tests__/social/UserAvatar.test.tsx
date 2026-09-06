import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { UserAvatar } from '@gamelog/social/user-card/UserAvatar';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import { clearSteamAvatarCache, cachePlayerAvatars } from '@gamelog/social/steamAvatarCache';

const renderWithProvider = (component: React.ReactElement) =>
  render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

describe('UserAvatar', () => {
  beforeEach(() => {
    clearSteamAvatarCache();
    jest.clearAllMocks();
  });

  it('renders fallback letter box when no avatarUrl is provided', () => {
    renderWithProvider(<UserAvatar username="Alex" />);

    expect(screen.getByTestId('user-avatar-fallback-text')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.queryByTestId('user-avatar-image')).toBeNull();
  });

  it('renders "U" fallback when username is empty', () => {
    renderWithProvider(<UserAvatar username="" />);

    expect(screen.getByText('U')).toBeTruthy();
  });

  it('renders avatar image when avatarUrl is provided', () => {
    renderWithProvider(<UserAvatar username="Alex" avatarUrl="https://example.com/avatar.jpg" />);

    const image = screen.getByTestId('user-avatar-image');
    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({ uri: 'https://example.com/avatar.jpg' });
    expect(screen.queryByTestId('user-avatar-fallback-text')).toBeNull();
  });

  it('falls back to letter box when avatar image errors', () => {
    renderWithProvider(<UserAvatar username="Alex" avatarUrl="https://example.com/invalid.jpg" />);

    const image = screen.getByTestId('user-avatar-image');
    expect(image).toBeTruthy();

    act(() => {
      fireEvent(image, 'error');
    });

    expect(screen.queryByTestId('user-avatar-image')).toBeNull();
    expect(screen.getByTestId('user-avatar-fallback-text')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('resolves avatarUrl from cache when steamId is provided', () => {
    cachePlayerAvatars([
      {
        steamid: '76561198000000001',
        avatarfull: 'https://example.com/cached_avatar.jpg',
      },
    ]);

    renderWithProvider(<UserAvatar username="Charlie" steamId="76561198000000001" />);

    const image = screen.getByTestId('user-avatar-image');
    expect(image).toBeTruthy();
    expect(image.props.source).toEqual({
      uri: 'https://example.com/cached_avatar.jpg',
    });
  });

  it('applies highlighted styling when isHighlighted is true', () => {
    const { rerender } = renderWithProvider(<UserAvatar username="Alex" isHighlighted={true} />);

    expect(screen.getByText('A')).toBeTruthy();

    rerender(
      <GluestackUIProvider mode="light">
        <UserAvatar
          username="Alex"
          avatarUrl="https://example.com/avatar.jpg"
          isHighlighted={true}
        />
      </GluestackUIProvider>
    );

    expect(screen.getByTestId('user-avatar-image')).toBeTruthy();
  });
});
