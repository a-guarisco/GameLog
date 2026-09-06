import { render, fireEvent } from '@testing-library/react-native';
import { DateFilter } from '@gamelog/game-list/filters/DateFilter';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('DateFilter', () => {
  it('renders Date chip with "All Time" when no filter is set', () => {
    const { getByText } = render(
      <DateFilter
        dateRangeFilter={{ from: undefined, to: undefined }}
        setDateRangeFilter={jest.fn()}
      />,
      { wrapper }
    );
    expect(getByText('Date', { exact: false })).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('renders Date chip with formatted date range when filter is set', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-12-31');
    const { getByText } = render(
      <DateFilter dateRangeFilter={{ from: start, to: end }} setDateRangeFilter={jest.fn()} />,
      { wrapper }
    );
    expect(getByText('Date', { exact: false })).toBeTruthy();
    expect(getByText('Custom')).toBeTruthy();
  });

  it('opens modal on press and allows applying dates', () => {
    const setDateRangeFilter = jest.fn();
    const { getByText, queryByText } = render(
      <DateFilter
        dateRangeFilter={{ from: undefined, to: undefined }}
        setDateRangeFilter={setDateRangeFilter}
      />,
      { wrapper }
    );

    expect(queryByText('Filter by Last Played')).toBeNull();

    fireEvent.press(getByText('Date', { exact: false }));
    expect(getByText('Filter by Date Range')).toBeTruthy();

    fireEvent.press(getByText('Apply'));
    expect(setDateRangeFilter).toHaveBeenCalled();
  });
});
