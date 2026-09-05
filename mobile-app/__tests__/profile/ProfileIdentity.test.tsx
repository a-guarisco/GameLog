import { render, screen } from '@testing-library/react-native';
import ProfileIdentity from '@gamelog/profile/ProfileIdentity';

const PROPS = {
  name: 'filopixel',
  avatarUrl: 'https://cdn/avatar.jpg',
  streakText: '12 day streak',
  memberSinceLabel: 'Since 2011',
  mostPlayedName: 'War Thunder',
};

describe('ProfileIdentity', () => {
  it('renders the persona name', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByText('filopixel')).toBeTruthy();
  });

  it('shows the streak in the accent chip', () => {
    render(<ProfileIdentity {...PROPS} />);

    expect(screen.getByTestId('profile-streak-chip').props.className).toContain('bg-semantic-streak-500');
    expect(screen.getByText('12 day streak')).toBeTruthy();
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
});
