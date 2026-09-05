import { render, fireEvent } from '@testing-library/react-native';
import ProfileGenresTab from '@gamelog/profile/tabs/ProfileGenresTab';
import { useOrientation } from '@gamelog/common/useOrientation';

jest.mock('@gamelog/common/useOrientation', () => ({
  useOrientation: jest.fn(),
}));

jest.mock('@gamelog/common/charts/genre-radar/GameGenreRadarChart', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ ownedGames, targetHeight }: any) => (
      <View testID="mock-game-genre-radar">
        <Text testID="target-height">{String(targetHeight)}</Text>
      </View>
    ),
  };
});

jest.mock('@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart', () => {
  const { View, TouchableOpacity, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ ownedGames, onExpandedChange, style }: any) => (
      <View testID="mock-community-genre-radar" style={style}>
        <TouchableOpacity
          testID="toggle-expand"
          onPress={() => onExpandedChange?.(true)}
        >
          <Text>Expand</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="toggle-collapse"
          onPress={() => onExpandedChange?.(false)}
        >
          <Text>Collapse</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

describe('ProfileGenresTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders stacked charts in portrait mode', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      width: 400,
      height: 800,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    expect(getByTestId('mock-game-genre-radar')).toBeTruthy();
    expect(getByTestId('mock-community-genre-radar')).toBeTruthy();
  });

  it('renders side-by-side 50/50 layout in landscape mode', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    expect(getByTestId('mock-game-genre-radar')).toBeTruthy();
    expect(getByTestId('mock-community-genre-radar')).toBeTruthy();
  });

  it('uses initial fallback and updates closedHeight on layout to match community card', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    // Initially targetHeight uses initial closed height fallback (400 * 0.55 + 110 = 330)
    expect(getByTestId('target-height').props.children).toBe('330');

    // Simulate community card container layout event
    const communityWrapper = getByTestId('mock-community-genre-radar').parent;
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });

    // targetHeight on left chart should now match measured height
    expect(getByTestId('target-height').props.children).toBe('350');
  });

  it('keeps left chart fixed at closedHeight and does not expand when community chart is expanded', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    // Measure closed height
    const communityWrapper = getByTestId('mock-community-genre-radar').parent;
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });
    expect(getByTestId('target-height').props.children).toBe('350');

    // Expand community chart
    fireEvent.press(getByTestId('toggle-expand'));

    // Left card must NOT expand with the right card; it stays fixed at closed height (350)
    expect(getByTestId('target-height').props.children).toBe('350');

    // Simulate community card expanding on layout (e.g. to 600) while expanded
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 600 } },
    });

    // Left card still stays at closed height (350), not 600
    expect(getByTestId('target-height').props.children).toBe('350');

    // Collapse community chart again
    fireEvent.press(getByTestId('toggle-collapse'));

    // Still at 350
    expect(getByTestId('target-height').props.children).toBe('350');
  });

  it('ignores loading spinner height and keeps initial fallback without shrinking', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    expect(getByTestId('target-height').props.children).toBe('330');

    // Simulate community card container rendering a small loading spinner (~110px)
    const communityWrapper = getByTestId('mock-community-genre-radar').parent;
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 110 } },
    });

    // Left card must NOT shrink to spinner height; it retains initial fallback (330)
    expect(getByTestId('target-height').props.children).toBe('330');
  });

  it('keeps left chart locked once data is loaded and does not shrink on subsequent scope changes', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: true,
      width: 800,
      height: 400,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    const communityWrapper = getByTestId('mock-community-genre-radar').parent;

    // Initial load completes with data height 350
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });
    expect(getByTestId('target-height').props.children).toBe('350');

    // Scope changed: community card shows spinner (e.g. 110px)
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 110 } },
    });

    // Left card stays locked at 350 once data has loaded
    expect(getByTestId('target-height').props.children).toBe('350');

    // Scope data finishes loading (e.g. 350px or slight variance)
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 350 } },
    });
    expect(getByTestId('target-height').props.children).toBe('350');

    // Community card receives minHeight style to prevent shrinking
    const communityRadar = getByTestId('mock-community-genre-radar');
    expect(communityRadar.props.style).toEqual(
      expect.objectContaining({ minHeight: 350 })
    );
  });

  it('renders side-by-side 2-column layout in tablet portrait mode and equalizes height', () => {
    (useOrientation as jest.Mock).mockReturnValue({
      isLandscape: false,
      isTablet: true,
      width: 768,
      height: 1024,
    });

    const { getByTestId } = render(<ProfileGenresTab ownedGames={null} />);

    // In tablet portrait, initial fallback is min(1024 * 0.45, 520) = 461
    expect(getByTestId('target-height').props.children).toBe('461');

    // Simulate community card measuring 480
    const communityWrapper = getByTestId('mock-community-genre-radar').parent;
    fireEvent(communityWrapper, 'layout', {
      nativeEvent: { layout: { height: 480 } },
    });

    expect(getByTestId('target-height').props.children).toBe('480');
  });
});
