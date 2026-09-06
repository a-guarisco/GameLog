import { render, fireEvent } from '@testing-library/react-native';
import { PlatformFilter } from '@gamelog/game-list/filters/PlatformFilter';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('PlatformFilter', () => {
  it('renders Platform chip with current selection', () => {
    const { getByText } = render(
      <PlatformFilter platformFilter="All" setPlatformFilter={jest.fn()} />,
      { wrapper }
    );
    expect(getByText('Platform', { exact: false })).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('opens modal and calls setPlatformFilter when an option is selected', () => {
    const setPlatformFilter = jest.fn();
    const { getByText, queryByText } = render(
      <PlatformFilter platformFilter="All" setPlatformFilter={setPlatformFilter} />,
      { wrapper }
    );

    expect(queryByText('Filter by Platform')).toBeNull();

    fireEvent.press(getByText('Platform', { exact: false }));
    expect(getByText('Filter by Platform')).toBeTruthy();

    fireEvent.press(getByText('Windows'));
    expect(setPlatformFilter).toHaveBeenCalledWith('Windows');
  });
});
