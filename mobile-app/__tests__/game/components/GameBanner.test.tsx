import { render, screen } from '@testing-library/react-native';
import GameBanner from '@gamelog/game/HeaderGameImage';

jest.mock('@gamelog/common/Banner', () => {
  const { View } = jest.requireActual('react-native');
  const MockBanner = ({ imageUrl, minHeight, heightPercentage }: any) => (
    <View
      testID="banner"
      accessibilityLabel={`banner-${imageUrl}-${minHeight}-${heightPercentage}`}
    />
  );
  MockBanner.displayName = 'MockBanner';
  return MockBanner;
});

jest.mock('@gamelog/common/BannerInfo', () => {
  const { View, Text } = jest.requireActual('react-native');
  const MockBannerInfo = ({ title, iconUrl, secondaryText }: any) => (
    <View testID="banner-info">
      <Text testID="banner-title">{title}</Text>
      <Text testID="banner-secondary">{secondaryText}</Text>
      <Text testID="banner-icon">{iconUrl}</Text>
    </View>
  );
  MockBannerInfo.displayName = 'MockBannerInfo';
  return MockBannerInfo;
});

jest.mock('@gamelog/common/gluestack/vstack', () => {
  const { View } = jest.requireActual('react-native');
  const MockVStack = ({ children, className }: any) => (
    <View testID="vstack" className={className}>
      {children}
    </View>
  );
  MockVStack.displayName = 'MockVStack';
  return { VStack: MockVStack };
});

const defaultProps = {
  appid: '123456',
  title: 'Test Game',
  streak: 5,
};

describe('GameBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders banner content correctly', () => {
    render(<GameBanner {...defaultProps} />);

    expect(screen.getByTestId('banner')).toBeTruthy();
    expect(screen.getByTestId('banner-info')).toBeTruthy();
  });

  it('displays the game title in BannerInfo', () => {
    render(<GameBanner {...defaultProps} />);

    expect(screen.getByTestId('banner-title').props.children).toBe('Test Game');
  });

  it('shows fire emoji and streak count when streak is greater than 0', () => {
    render(<GameBanner {...defaultProps} streak={7} />);

    expect(screen.getByTestId('banner-secondary').props.children).toBe('🔥 7 day streak');
  });

  it('shows plain streak count (no fire emoji) when streak is 0', () => {
    render(<GameBanner {...defaultProps} streak={0} />);

    expect(screen.getByTestId('banner-secondary').props.children).toBe('0 day streak');
  });

  it('passes the correct image URLs from steam asset helpers', () => {
    render(<GameBanner {...defaultProps} appid="123" />);

    const banner = screen.getByTestId('banner');
    const bannerInfoIcon = screen.getByTestId('banner-icon');

    expect(banner.props.accessibilityLabel).toContain('123');
    expect(bannerInfoIcon.props.children).toContain('123');
  });
});
