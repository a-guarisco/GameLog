import { render, screen, fireEvent } from '@testing-library/react-native';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import ExternalLabelBox from '@gamelog/common/charts/ExternalLabelBox';
import * as GiftedCharts from 'react-native-gifted-charts';

jest.mock('@gamelog/components/ui/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: {
      '--color-background-100': '255,255,255',
      '--color-typography-100': '255,255,255',
      '--color-typography-200': '150,150,150',
      '--color-background-300': '200,200,200',
    },
    dark: {
      '--color-background-100': '0,0,0',
      '--color-typography-100': '0,0,0',
      '--color-typography-200': '100,100,100',
      '--color-background-300': '50,50,50',
    },
  },
}));

jest.mock('@gamelog/components/ui/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/components/ui/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text> };
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
  return { PieChart: jest.fn((props: any) => <View testID="pie-chart" />) };
});

jest.mock('@gamelog/common/charts/ExternalLabelBox', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: jest.fn(() => <View testID="external-label-box" />),
  };
});

const mockUseGetOwnedGames = jest.fn();
jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetOwnedGames: (...args: any[]) => mockUseGetOwnedGames(...args),
}));

const makeGame = (name: string, playtime_forever: number) => ({ name, playtime_forever });

const renderWithGames = (games: ReturnType<typeof makeGame>[]) => {
  mockUseGetOwnedGames.mockReturnValue({
    ownedGames: { response: { games } },
    isLoadingOwnedGames: false,
    errorOwnedGames: null,
  });
  render(<TotalHoursPieChart />);
  fireEvent(screen.getByTestId('card'), 'layout', {
    nativeEvent: { layout: { width: 300 } },
  });
};

describe('TotalHoursPieChart', () => {
  it('shows spinner while loading', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: true,
      errorOwnedGames: null,
    });
    render(<TotalHoursPieChart />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('shows error state when request fails', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: new Error('fail'),
    });
    render(<TotalHoursPieChart />);
    expect(screen.getByTestId('chart-error')).toBeTruthy();
  });

  it('renders PieChart and ExternalLabelBox after layout', () => {
    renderWithGames([makeGame('Half-Life', 360)]);
    expect(screen.getByTestId('pie-chart')).toBeTruthy();
    expect(screen.getByTestId('external-label-box')).toBeTruthy();
  });
});

describe('getPieData logic', () => {
  let capturedData: any[] = [];

  beforeEach(() => {
    (GiftedCharts.PieChart as jest.Mock).mockImplementation((props: any) => {
      capturedData = props.data;
      const { View } = jest.requireActual('react-native');
      return <View testID="pie-chart" />;
    });
  });

  it('returns empty array when ownedGames is null', () => {
    mockUseGetOwnedGames.mockReturnValue({
      ownedGames: null,
      isLoadingOwnedGames: false,
      errorOwnedGames: null,
    });
    render(<TotalHoursPieChart />);
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    expect(capturedData).toEqual([]);
  });

  it('filters out games with 0 playtime', () => {
    renderWithGames([makeGame('Active Game', 120), makeGame('Never Played', 0)]);
    expect(capturedData.every((d) => d.value > 0)).toBe(true);
    expect(capturedData.some((d) => d.label === 'Never Played')).toBe(false);
  });

  it('caps top entries at 5 and groups the rest into "Other"', () => {
    const games = Array.from({ length: 8 }, (_, i) => makeGame(`Game ${i}`, (i + 1) * 60));
    renderWithGames(games);
    const labels = capturedData.map((d: any) => d.label);
    expect(capturedData.length).toBeLessThanOrEqual(6);
    expect(labels).toContain('Other');
  });

  it('does not add "Other" slice when there are 5 or fewer games', () => {
    renderWithGames([makeGame('A', 300), makeGame('B', 240), makeGame('C', 180)]);
    expect(capturedData.some((d: any) => d.label === 'Other')).toBe(false);
  });

  it('truncates label at 12 chars and appends ellipsis for long names', () => {
    renderWithGames([makeGame('A Very Long Game Name', 120)]);
    const topSlice = capturedData[0];
    expect(topSlice.label).toMatch(/…$/);
    expect(topSlice.label.length).toBeLessThanOrEqual(13);
  });

  it('sorts slices so the highest playtime is first', () => {
    renderWithGames([makeGame('Low', 60), makeGame('High', 600), makeGame('Mid', 300)]);
    const realSlices = capturedData.filter((d: any) => d.label !== 'Other');
    expect(realSlices[0].value).toBeGreaterThanOrEqual(realSlices[1]?.value ?? 0);
  });
});

describe('lamdaFormatLabel', () => {
  let capturedGraphData: any[] = [];

  beforeEach(() => {
    (ExternalLabelBox as jest.Mock).mockImplementation((props: any) => {
      capturedGraphData = props.graphData;
      const { View } = jest.requireActual('react-native');
      return <View testID="external-label-box" />;
    });
  });

  it('formats minutes under one hour as "Xm"', () => {
    renderWithGames([makeGame('Short Game', 45)]);
    const fmt = capturedGraphData[0].lamdaFormatLabel('45');
    expect(fmt).toMatch(/45m/);
  });

  it('formats minutes over one hour as "Xh Ym"', () => {
    renderWithGames([makeGame('Long Game', 90)]);
    const fmt = capturedGraphData[0].lamdaFormatLabel('90');
    expect(fmt).toMatch(/1h 30m/);
  });

  it('includes percentage of total in the label', () => {
    renderWithGames([makeGame('Only Game', 120)]);
    const fmt = capturedGraphData[0].lamdaFormatLabel('120');
    expect(fmt).toMatch(/100%/);
  });
});
