import { render, screen, fireEvent } from '@testing-library/react-native';
import * as GiftedCharts from 'react-native-gifted-charts';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: { '--color-background-100': '255,255,255', '--color-typography-200': '150,150,150' },
    dark: { '--color-background-100': '0,0,0', '--color-typography-200': '100,100,100' },
  },
}));

jest.mock('@gamelog/components/ui/box', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Box: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/components/ui/card', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Card: ({ children, onLayout, ...props }: any) => (
      <View testID="card" onLayout={onLayout} {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('@gamelog/components/ui/spinner', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Spinner: () => <View testID="spinner" /> };
});

jest.mock('@gamelog/theme/theme', () => ({
  brand: {
    info: Object.fromEntries(
      ['0', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((k) => [
        k,
        `0,0,${k}`,
      ])
    ),
  },
}));

jest.mock('@gamelog/common/charts/ChartErrorHandler', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: () => <View testID="chart-error" />,
  };
});

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { PieChart: jest.fn((props: any) => <View testID="pie-chart" />) };
});

const mockUseGetOwnedGames = jest.fn();
jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: (...args: any[]) => mockUseGetOwnedGames(...args),
}));

const makeGames = (overrides: object[] = []) =>
  overrides.map((o) => ({
    playtime_windows_forever: 0,
    playtime_mac_forever: 0,
    playtime_linux_forever: 0,
    playtime_deck_forever: 0,
    ...o,
  }));

describe('OsShareChart', () => {
  it('shows spinner while loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });
    render(<OsShareChart />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows error state when request fails', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });
    render(<OsShareChart />);
    expect(screen.getByTestId('chart-error')).toBeTruthy();
  });

  it('renders the PieChart after layout when data is available', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: {
        response: {
          games: makeGames([{ playtime_windows_forever: 120, playtime_mac_forever: 60 }]),
        },
      },
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    render(<OsShareChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    expect(screen.getByTestId('pie-chart')).toBeTruthy();
  });
});

describe('buildPieData logic', () => {
  beforeEach(() => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
  });

  it('filters out platforms with 0 minutes', () => {
    let capturedData: any[] = [];
    const { View } = jest.requireActual('react-native');
    (GiftedCharts.PieChart as jest.Mock).mockImplementation((props: any) => {
      capturedData = props.data;
      return <View testID="pie-chart" />;
    });

    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: {
        response: {
          games: makeGames([{ playtime_windows_forever: 120 }]),
        },
      },
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    render(<OsShareChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });

    expect(capturedData).toHaveLength(1);
    expect(capturedData[0].value).toBe(2);
  });

  it('returns empty array when ownedGames is null', () => {
    let capturedData: any[] | null = null;
    const { View } = jest.requireActual<typeof import('react-native')>('react-native');

    (GiftedCharts.PieChart as jest.Mock).mockImplementation((props: any) => {
      capturedData = props.data;
      return <View testID="pie-chart" />;
    });

    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });

    render(<OsShareChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });

    expect(capturedData).toEqual([]);
  });
});
