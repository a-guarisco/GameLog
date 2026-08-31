import { render } from '@testing-library/react-native';
import TotalHoursDoughnut from '@gamelog/common/charts/total-hours/TotalHoursDoughnut';
import { formatMinutesToHours } from '@gamelog/utils/formatUtils';

import { useTotalHoursDoughnut } from '@gamelog/common/charts/total-hours/useTotalHoursDoughnut';

jest.mock('react-native-gifted-charts', () => ({ PieChart: 'PieChart' }));

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View {...props} /> };
});

jest.mock('@gamelog/common/gluestack/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text };
});

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  computePieRadius: jest.fn(() => 100),
  computePieInnerRadius: jest.fn(() => 50),
  parseRGB: jest.requireActual('@gamelog/common/charts/chartsHelpers').parseRGB,
}));

jest.mock('@gamelog/utils/formatUtils', () => ({
  formatMinutesToHours: jest.fn((m) => `${m}m`),
}));

jest.mock('@gamelog/common/charts/total-hours/useTotalHoursDoughnut', () => ({
  useTotalHoursDoughnut: jest.fn(() => ({
    pieData: [
      { value: 60, label: 'Game A', color: '#a' },
      { value: 40, label: 'Game B', color: '#b' },
    ],
    totalMinutes: 100,
  })),
}));

jest.mock('@gamelog/common/charts/ChartWrapperCard', () => {
  const { View } = jest.requireActual('react-native');
  const MockChartWrapperCard = ({ children, isLoading, error }: any) => (
    <View testID="chart-wrapper">
      {!isLoading &&
        !error &&
        children({
          cardWidth: 400,
          theme: {
            '--color-typography-200': '200,200,200',
            '--color-typography-100': '100,100,100',
            '--color-background-100': '0,0,0',
            '--color-background-50': '50,50,50',
          },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

const USER_ID = 'test-user-123';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

describe('TotalHoursDoughnut', () => {
  it('renders PieChart when data is available', () => {
    const { UNSAFE_getByType } = render(<TotalHoursDoughnut userId={USER_ID} />);

    expect(UNSAFE_getByType('PieChart' as any)).toBeTruthy();
  });

  it('derives innerCircleColor from theme', () => {
    const { UNSAFE_getByType } = render(<TotalHoursDoughnut userId={USER_ID} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    expect(pie.props.innerCircleColor).toBe('rgb(50,50,50)');
  });

  it('formats tooltip label correctly', () => {
    const { UNSAFE_getByType } = render(<TotalHoursDoughnut userId={USER_ID} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    const tooltipElement = pie.props.tooltipComponent(0);
    const { getByText } = render(tooltipElement);

    expect(formatMinutesToHours).toHaveBeenCalledWith(60);
    expect(getByText(/Game A/)).toBeTruthy();
  });

  it('renders center label correctly', () => {
    const { UNSAFE_getByType } = render(<TotalHoursDoughnut userId={USER_ID} />);
    const pie = UNSAFE_getByType('PieChart' as any);

    const centerElement = pie.props.centerLabelComponent();
    const { getByText } = render(centerElement);

    expect(getByText('Game A')).toBeTruthy();
    expect(getByText('Game B')).toBeTruthy();
  });

  it('renders placeholder when data is empty', () => {
    const { useTotalHoursDoughnut } = require('@gamelog/common/charts/total-hours/useTotalHoursDoughnut');
    useTotalHoursDoughnut.mockReturnValueOnce({
      pieData: [],
      totalMinutes: 0,
    });

    const { getByText } = render(<TotalHoursDoughnut userId={USER_ID} />);

    expect(getByText('No games found')).toBeTruthy();
  });
});
