import { render, screen, fireEvent } from '@testing-library/react-native';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import * as GiftedCharts from 'react-native-gifted-charts';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: { '--color-background-100': '255,255,255', '--color-typography-200': '150,150,150' },
    dark: { '--color-background-100': '0,0,0', '--color-typography-200': '100,100,100' },
  },
}));

jest.mock('@gamelog/components/ui/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/components/ui/card', () => {
  const { View } = jest.requireActual('react-native');
  return {
    Card: ({ children, onLayout, ...props }: any) => (
      <View testID="card" onLayout={onLayout} {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('@gamelog/components/ui/spinner', () => {
  const { View } = jest.requireActual('react-native');
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
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: () => <View testID="chart-error" />,
  };
});

jest.mock('react-native-gifted-charts', () => {
  const { View } = jest.requireActual('react-native');
  return { BarChart: jest.fn((props: any) => <View testID="bar-chart" />) };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const mockUseGetOwnedGames = jest.fn();
jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: (...args: any[]) => mockUseGetOwnedGames(...args),
}));

const makeGame = (name: string, playtime_forever: number, appid = '1') => ({
  name,
  playtime_forever,
  appid,
});

describe('TotalHoursChart', () => {
  it('shows spinner while loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });
    render(<TotalHoursChart />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows error state when request fails', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });
    render(<TotalHoursChart />);
    expect(screen.getByTestId('chart-error')).toBeTruthy();
  });

  it('renders BarChart after layout when data is available', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games: [makeGame('Half-Life', 360, '70')] } },
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    render(<TotalHoursChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    expect(screen.getByTestId('bar-chart')).toBeTruthy();
  });
});

describe('getBarData logic', () => {
  let capturedData: any[] = [];

  beforeEach(() => {
    (GiftedCharts.BarChart as jest.Mock).mockImplementation((props: any) => {
      capturedData = props.data;
      const { View } = jest.requireActual('react-native');
      return <View testID="bar-chart" />;
    });
  });

  const renderWithGames = (games: ReturnType<typeof makeGame>[]) => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: { response: { games } },
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    render(<TotalHoursChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
  };

  it('returns empty array when ownedGames is null', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    render(<TotalHoursChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    expect(capturedData).toEqual([]);
  });

  it('converts playtime_forever minutes to hours', () => {
    renderWithGames([makeGame('Balatro', 120, '400')]);
    expect(capturedData[0].value).toBe(2);
  });

  it('sorts descending by value', () => {
    renderWithGames([
      makeGame('Game A', 60, '1'),
      makeGame('Game B', 300, '2'),
      makeGame('Game C', 180, '3'),
    ]);
    expect(capturedData[0].value).toBeGreaterThanOrEqual(capturedData[1].value);
    expect(capturedData[1].value).toBeGreaterThanOrEqual(capturedData[2].value);
  });

  it('caps at 100 entries', () => {
    const games = Array.from({ length: 150 }, (_, i) =>
      makeGame(`Game ${i}`, (i + 1) * 60, String(i))
    );
    renderWithGames(games);
    expect(capturedData.length).toBeLessThanOrEqual(100);
  });

  it('truncates label at 10 chars and appends ellipsis for long names', () => {
    renderWithGames([makeGame('A Very Long Game Name', 60, '1')]);
    expect(capturedData[0].label).toMatch(/\.\.\.$/);
  });

  it('assigns frontColor and gradientColor from percentile helper', () => {
    renderWithGames([makeGame('Top', 600, '1'), makeGame('Bottom', 60, '2')]);
    capturedData.forEach((item) => {
      expect(item.frontColor).toBeTruthy();
      expect(item.gradientColor).toBeTruthy();
    });
  });
});
