import { render, screen } from '@testing-library/react-native';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';

jest.mock('@gamelog/common/Banner', () => {
  const { View } = jest.requireActual('react-native');
  const MockBanner = ({ imageUrl, minHeight, heightPercentage, scrollable }: any) => (
    <View
      testID="banner"
      accessibilityLabel={`banner-${imageUrl}-${minHeight}-${heightPercentage}-${scrollable ? 'scrollable' : 'static'}`}
    />
  );
  MockBanner.displayName = 'MockBanner';
  return MockBanner;
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
};

describe('HeaderGameImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the banner image content', () => {
    render(<HeaderGameImage {...defaultProps} />);

    expect(screen.getByTestId('banner')).toBeTruthy();
  });

  it('uses the expected Steam header URL for the app id', () => {
    render(<HeaderGameImage {...defaultProps} />);

    expect(screen.getByTestId('banner').props.accessibilityLabel).toContain(
      'https://cdn.akamai.steamstatic.com/steam/apps/123456/header.jpg'
    );
  });

  it('passes stable banner sizing to the shared Banner component', () => {
    render(<HeaderGameImage {...defaultProps} />);

    const banner = screen.getByTestId('banner');

    expect(banner.props.accessibilityLabel).toContain('-140-18');
  });

  it('renders without appid', () => {
    render(<HeaderGameImage />);
    expect(screen.getByTestId('banner')).toBeTruthy();
  });

  it('passes scrollable=true to shared Banner component when not contained', () => {
    render(<HeaderGameImage {...defaultProps} scrollable={true} />);
    const banner = screen.getByTestId('banner');
    expect(banner.props.accessibilityLabel).toContain('-scrollable');
  });

  it('passes scrollable=true to shared Banner component when contained', () => {
    render(<HeaderGameImage {...defaultProps} contained={true} scrollable={true} />);
    const banner = screen.getByTestId('banner');
    expect(banner.props.accessibilityLabel).toContain('-scrollable');
  });

  it('passes scrollable=false by default', () => {
    render(<HeaderGameImage {...defaultProps} />);
    const banner = screen.getByTestId('banner');
    expect(banner.props.accessibilityLabel).toContain('-static');
  });
});

