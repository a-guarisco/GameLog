import { render, screen } from '@testing-library/react-native';
import PlatformSplitChart from '@gamelog/common/charts/platform-split/PlatformSplitChart';
import type { PlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View, Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ children, testID, error, ErrorBehaviour, label }: any) => {
      if (error && ErrorBehaviour) {
        return (
          <View testID={testID}>
            <Text>{label}</Text>
            <ErrorBehaviour />
          </View>
        );
      }
      if (error) {
        return (
          <View testID={testID}>
            <Text>{label}</Text>
          </View>
        );
      }
      return (
        <View testID={testID}>
          <Text>{label}</Text>
          {children({ cardWidth: 370, theme: {} })}
        </View>
      );
    },
  };
});

const SPLIT: PlatformSplit = {
  shares: [
    {
      id: 'windows',
      name: 'Windows',
      icon: 'logo-windows',
      minutes: 69120,
      hoursLabel: '1,152h',
      percent: 80,
      percentLabel: '80%',
    },
    {
      id: 'deck',
      name: 'Steam Deck',
      icon: 'logo-steam',
      minutes: 9480,
      hoursLabel: '158h',
      percent: 11,
      percentLabel: '11%',
    },
    {
      id: 'mac',
      name: 'macOS',
      icon: 'logo-apple',
      minutes: 60,
      hoursLabel: '1h',
      percent: 0.4,
      percentLabel: '<1%',
    },
  ],
  totalLabel: '1,311h',
  hasPlaytime: true,
};

const EMPTY: PlatformSplit = { shares: [], totalLabel: '0h', hasPlaytime: false };

describe('PlatformSplitChart', () => {
  it('labels the block and leads with the lifetime total', () => {
    render(<PlatformSplitChart split={SPLIT} />);

    expect(screen.getByText('Hours by platform')).toBeTruthy();
    expect(screen.getByText('1,311h')).toBeTruthy();
    expect(screen.getByText('across 3 platforms')).toBeTruthy();
  });

  it('counts a single platform in the singular', () => {
    render(<PlatformSplitChart split={{ ...SPLIT, shares: [SPLIT.shares[0]] }} />);

    expect(screen.getByText('across 1 platform')).toBeTruthy();
  });

  it('renders a row per platform with its hours and share', () => {
    render(<PlatformSplitChart split={SPLIT} />);

    SPLIT.shares.forEach((share) => {
      expect(screen.getByText(share.name)).toBeTruthy();
      expect(screen.getByText(share.hoursLabel)).toBeTruthy();
      expect(screen.getByTestId(`profile-platform-percent-${share.id}`)).toHaveTextContent(
        share.percentLabel
      );
    });
  });

  it('sizes each bar segment by its share', () => {
    render(<PlatformSplitChart split={SPLIT} />);

    expect(screen.getByTestId('profile-platform-segment-windows').props.style).toEqual(
      expect.objectContaining({ flexGrow: 80, flexBasis: 0 })
    );
    expect(screen.getByTestId('profile-platform-segment-deck').props.style).toEqual(
      expect.objectContaining({ flexGrow: 11 })
    );
  });

  it('keeps a sliver of a platform visible in the bar', () => {
    render(<PlatformSplitChart split={SPLIT} />);

    expect(screen.getByTestId('profile-platform-segment-mac').props.style).toEqual(
      expect.objectContaining({ minWidth: 3 })
    );
  });

  it('explains a library with no platform playtime', () => {
    render(<PlatformSplitChart split={EMPTY} />);

    expect(screen.getByText('No platform playtime recorded yet')).toBeTruthy();
    expect(screen.queryByTestId('profile-platform-segment-windows')).toBeNull();
  });

  it('says the library failed rather than claiming nothing was played', () => {
    render(<PlatformSplitChart split={SPLIT} hasError />);

    expect(screen.getByText('Could not load platform playtime')).toBeTruthy();
    expect(screen.queryByText('No platform playtime recorded yet')).toBeNull();
    expect(screen.queryByTestId('profile-platform-segment-windows')).toBeNull();
  });

  it('reuses the darkest tone once the ramp runs out', () => {
    const fourPlusOne = {
      ...SPLIT,
      shares: [...SPLIT.shares, ...SPLIT.shares].map((share, index) => ({
        ...share,
        id: `${share.id}-${index}`,
      })),
    };

    render(<PlatformSplitChart split={fourPlusOne} />);

    expect(screen.getByTestId('profile-platform-segment-windows-3')).toBeTruthy();
    expect(screen.getByTestId('profile-platform-segment-mac-5')).toBeTruthy();
  });
});
