import { render, fireEvent } from '@testing-library/react-native';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import { useNavigation } from '@react-navigation/native';
import { useTotalHoursChart } from '@gamelog/common/charts/total-hours/useTotalHoursChart';

jest.mock('@react-navigation/native', () => ({ useNavigation: jest.fn() }));
jest.mock('@gamelog/common/charts/total-hours/useTotalHoursChart', () => ({
  useTotalHoursChart: jest.fn(() => ({
    barData: [
      {
        value: 120,
        appid: '42',
        frontColor: '#a',
        gradientColor: '#b',
        label: 'Game A',
        name: 'Game A',
      },
    ],
    isLoading: false,
    error: null,
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
          theme: { '--color-typography-200': '200,200,200' },
        })}
    </View>
  );

  MockChartWrapperCard.displayName = 'MockChartWrapperCard';
  return MockChartWrapperCard;
});

const mockUseNavigation = useNavigation as jest.Mock;
const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseNavigation.mockReturnValue({ navigate: mockNavigate });
});

describe('TotalHoursChart', () => {
  it('renders game list when data is available', () => {
    const { getByText } = render(<TotalHoursChart ownedGames={null} />);
    expect(getByText('Game A')).toBeTruthy();
  });

  it('navigates to Game screen with the correct appid and name when game is pressed', () => {
    const { getByText } = render(<TotalHoursChart ownedGames={null} />);
    fireEvent.press(getByText('Game A'));

    expect(mockNavigate).toHaveBeenCalledWith('GameListTab', {
      screen: 'Game',
      params: { gameItem: { appid: '42', name: 'Game A' } },
    });
  });

  it('renders empty state message when barData is empty', () => {
    (useTotalHoursChart as jest.Mock).mockReturnValueOnce({
      barData: [],
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<TotalHoursChart ownedGames={null} />);
    expect(getByText('No games found')).toBeTruthy();
  });

  it('renders correctly with targetHeight prop', () => {
    const { getByText } = render(<TotalHoursChart ownedGames={null} targetHeight={350} />);
    expect(getByText('Game A')).toBeTruthy();
  });
});
