import { render, screen } from '@testing-library/react-native';
import ProfileIdentity from '@gamelog/profile/ProfileIdentity';

const PROPS = {
  name: 'filopixel',
  avatarUrl: 'https://cdn/avatar.jpg',
  streakText: '🔥 12 day streak',
  memberSinceLabel: 'Since 2011',
  mostPlayedName: 'War Thunder',
};

describe('ProfileIdentity', () => {
  it('renders the persona name', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByText('filopixel')).toBeTruthy();
  });

  it('names the game behind the header artwork', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-most-played')).toBeTruthy();
    expect(screen.getByText(/War Thunder/)).toBeTruthy();
  });

  it('hides the caption when the library has no most played game', () => {
    render(<ProfileIdentity {...PROPS} mostPlayedName={undefined} />);

    expect(screen.queryByTestId('profile-most-played')).toBeNull();
  });

  it('shows the streak in the accent chip', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-streak-chip').props.className).toContain('bg-primary-500');
    expect(screen.getByText('🔥 12 day streak')).toBeTruthy();
  });

  it('shows the account age chip when Steam reports a creation date', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-member-since-chip')).toBeTruthy();
    expect(screen.getByText('Since 2011')).toBeTruthy();
  });

  it('drops the account age chip when there is no creation date', () => {
    render(<ProfileIdentity {...PROPS} memberSinceLabel={null} />);

    expect(screen.queryByTestId('profile-member-since-chip')).toBeNull();
  });

  it('renders the avatar image when the player has one', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByLabelText('filopixel avatar')).toBeTruthy();
  });

  it('drops the avatar image but keeps the name when there is no avatar', () => {
    render(<ProfileIdentity {...PROPS} avatarUrl={undefined} />);

    expect(screen.queryByLabelText('filopixel avatar')).toBeNull();
    expect(screen.getByText('filopixel')).toBeTruthy();
  });

  it('carries its own scrim so the caption reads over bright artwork', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-most-played').props.className).toContain('bg-black/60');
  });

  it('keeps the caption out of flow so it cannot collide with the avatar', () => {
    render(<ProfileIdentity {...PROPS} />);

    // The rail is zero-height and the caption is absolutely placed clear of the avatar's top.
    const { className } = screen.getByTestId('profile-most-played-rail').props;

    expect(className).toContain('absolute');
    expect(className).toContain('bottom-11');
  });

  it('centres the caption on the banner, like the rest of the identity block', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-most-played-rail').props.className).toContain(
      'justify-center'
    );
  });

  it('truncates a long game name instead of overflowing the artwork', () => {
    render(<ProfileIdentity {...PROPS} mostPlayedName="The Witcher 3: Wild Hunt — Complete" />);

    expect(screen.getByText(/The Witcher 3/).props.numberOfLines).toBe(1);
  });
});
