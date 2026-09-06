import { StyleSheet, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import {
  NAV_RAIL_WIDTH_PHONE,
  NAV_RAIL_WIDTH_TABLET,
  getNavRailWidth,
  shouldShowNavRail,
  getNavRailOffset,
} from '@gamelog/common/navConstants';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import HeaderGameImage from '@gamelog/common/HeaderGameImage';
import GameListView from '@gamelog/game-list/GameListView';
import * as OrientationHook from '@gamelog/common/useOrientation';
import * as SafeAreaHook from 'react-native-safe-area-context';
import { useGameList } from '@gamelog/game-list/useGameList';

jest.mock('@gamelog/common/Banner', () => {
  const { View } = jest.requireActual('react-native');
  // eslint-disable-next-line react/display-name, no-empty-pattern
  return ({}: any) => <View testID="mock-banner" />;
});

jest.mock('expo-blur', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BlurTargetView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    BlurView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});

jest.mock('@gamelog/game-list/useGameList');
jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamId: jest.fn(() => '123456789'),
}));
jest.mock('@gamelog/common/gluestack/spinner', () => ({
  Spinner: 'Spinner',
}));
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});
jest.mock('@react-navigation/native-stack', () => ({
  NativeStackNavigationProp: jest.fn(),
}));

describe('Tablet Portrait Layout and navConstants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(SafeAreaHook, 'useSafeAreaInsets').mockReturnValue({
      top: 20,
      bottom: 10,
      left: 15,
      right: 15,
    });
  });

  describe('navConstants', () => {
    it('defines expected phone and tablet rail constants', () => {
      expect(NAV_RAIL_WIDTH_PHONE).toBe(74);
      expect(NAV_RAIL_WIDTH_TABLET).toBe(88);
    });

    it('getNavRailWidth returns correct width based on tablet flag', () => {
      expect(getNavRailWidth(false)).toBe(74);
      expect(getNavRailWidth(true)).toBe(88);
    });

    it('shouldShowNavRail activates rail only for landscape', () => {
      expect(shouldShowNavRail(false, false)).toBe(false); // phone portrait
      expect(shouldShowNavRail(true, false)).toBe(true); // phone landscape
      expect(shouldShowNavRail(false, true)).toBe(false); // tablet portrait
      expect(shouldShowNavRail(true, true)).toBe(true); // tablet landscape
    });

    it('getNavRailOffset computes exact screen offsets', () => {
      // Phone portrait -> 0 offset
      expect(getNavRailOffset({ isLandscape: false, isTablet: false, insetsLeft: 15 })).toBe(0);

      // Phone landscape -> insetsLeft + 74
      expect(getNavRailOffset({ isLandscape: true, isTablet: false, insetsLeft: 15 })).toBe(
        15 + 74
      );

      // Tablet portrait -> 0 offset (reverted to bottom nav bar)
      expect(getNavRailOffset({ isLandscape: false, isTablet: true, insetsLeft: 15 })).toBe(0);

      // Tablet landscape -> insetsLeft + 88
      expect(getNavRailOffset({ isLandscape: true, isTablet: true, insetsLeft: 15 })).toBe(15 + 88);
    });
  });

  describe('ScrollablePage', () => {
    it('applies zero left padding in tablet portrait mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: true,
        width: 768,
        height: 1024,
      });

      const { UNSAFE_getByType } = render(
        <ScrollablePage hasBanner={false}>
          <Text>Content</Text>
        </ScrollablePage>
      );

      // The root component of ScrollablePage is Box with style={{ paddingLeft: leftPadding }}
      const rootBox = UNSAFE_getByType(ScrollablePage).children[0] as any;
      expect(StyleSheet.flatten(rootBox.props.style).paddingLeft).toBe(0);
    });

    it('applies zero left padding in phone portrait mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: false,
        width: 390,
        height: 844,
      });

      const { UNSAFE_getByType } = render(
        <ScrollablePage hasBanner={false}>
          <Text>Content</Text>
        </ScrollablePage>
      );

      const rootBox = UNSAFE_getByType(ScrollablePage).children[0] as any;
      expect(StyleSheet.flatten(rootBox.props.style).paddingLeft).toBe(0);
    });

    it('applies phone landscape rail padding in phone landscape mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: true,
        isTablet: false,
        width: 844,
        height: 390,
      });

      const { UNSAFE_getByType } = render(
        <ScrollablePage hasBanner={false}>
          <Text>Content</Text>
        </ScrollablePage>
      );

      const rootBox = UNSAFE_getByType(ScrollablePage).children[0] as any;
      expect(StyleSheet.flatten(rootBox.props.style).paddingLeft).toBe(15 + 74);
    });

    it('enables box-none pointerEvents for banner interaction when isTablet is true in portrait', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: true,
        width: 768,
        height: 1024,
      });

      const { getByTestId } = render(
        <ScrollablePage hasBanner={true}>
          <Text>Content</Text>
        </ScrollablePage>
      );

      const scrollView = getByTestId('scrollable-page-scroll');
      expect(scrollView.props.pointerEvents).toBe('box-none');
    });

    it('keeps auto pointerEvents for phone portrait with banner', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: false,
        width: 390,
        height: 844,
      });

      const { getByTestId } = render(
        <ScrollablePage hasBanner={true}>
          <Text>Content</Text>
        </ScrollablePage>
      );

      const scrollView = getByTestId('scrollable-page-scroll');
      expect(scrollView.props.pointerEvents).toBe('auto');
    });
  });

  describe('HeaderGameImage', () => {
    it('applies zero leftOffset in tablet portrait mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: true,
        width: 768,
        height: 1024,
      });

      const { UNSAFE_getByType } = render(<HeaderGameImage appid="12345" contained={false} />);
      const card = UNSAFE_getByType(HeaderGameImage).children[0] as any;
      expect(StyleSheet.flatten(card.props.style).left).toBe(0);
    });

    it('applies zero leftOffset in phone portrait mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: false,
        width: 390,
        height: 844,
      });

      const { UNSAFE_getByType } = render(<HeaderGameImage appid="12345" contained={false} />);
      const card = UNSAFE_getByType(HeaderGameImage).children[0] as any;
      expect(StyleSheet.flatten(card.props.style).left).toBe(0);
    });
  });

  describe('GameListView', () => {
    it('applies zero left padding while keeping 3 columns in tablet portrait mode', () => {
      jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
        isLandscape: false,
        isTablet: true,
        width: 768,
        height: 1024,
      });

      (useGameList as jest.Mock).mockReturnValue({
        isLoading: false,
        processedGames: [{ appid: 1, name: 'Portal', playtime_forever: 10 }],
        allAvailableGenres: [],
        dateRangeFilter: { from: undefined, to: undefined },
      });

      const { UNSAFE_getByType } = render(<GameListView />);
      const rootBox = UNSAFE_getByType(GameListView).children[0] as any;
      expect(StyleSheet.flatten(rootBox.props.style).paddingLeft).toBe(0);

      // Find the FlatList to check column count
      const flatList = rootBox.props.children.find(
        (child: any) => child?.type?.name === 'FlatList' || child?.props?.numColumns !== undefined
      );
      expect(flatList.props.numColumns).toBe(3);
    });
  });
});
