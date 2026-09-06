import { render, screen } from '@testing-library/react-native';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import * as OrientationHook from '@gamelog/common/useOrientation';

jest.mock('@gamelog/common/Banner', () => {
  const { View } = jest.requireActual('react-native');
  const MockBanner = ({ imageUrl, minHeight, heightPercentage, scrollable, alignTop }: any) => (
    <View
      testID="banner"
      accessibilityLabel={`banner-${imageUrl}-${minHeight}-${heightPercentage}-${scrollable ? 'scrollable' : 'static'}${alignTop ? '-top' : ''}`}
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
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });
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

  it('passes tablet banner sizing when isTablet is true', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: true,
      width: 800,
      height: 1280,
    });

    render(<HeaderGameImage {...defaultProps} />);

    const banner = screen.getByTestId('banner');

    expect(banner.props.accessibilityLabel).toContain('-260-26');
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

  it('passes scrollable=true when isTablet is true regardless of portrait or landscape', () => {
    // Portrait tablet
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: true,
      width: 800,
      height: 1280,
    });
    const portraitRender = render(<HeaderGameImage {...defaultProps} />);
    const portraitBanner = portraitRender.getByTestId('banner');
    expect(portraitBanner.props.accessibilityLabel).toContain('-scrollable');
    portraitRender.unmount();

    // Landscape tablet
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: true,
      width: 1280,
      height: 800,
    });
    const landscapeRender = render(<HeaderGameImage {...defaultProps} />);
    const landscapeBanner = landscapeRender.getByTestId('banner');
    expect(landscapeBanner.props.accessibilityLabel).toContain('-scrollable');
  });

  it('passes alignTop=true to Banner component when specified', () => {
    render(<HeaderGameImage {...defaultProps} alignTop={true} />);
    const banner = screen.getByTestId('banner');
    expect(banner.props.accessibilityLabel).toContain('-top');
  });
});

