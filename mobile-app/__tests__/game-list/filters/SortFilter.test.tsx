import { render, fireEvent } from '@testing-library/react-native';
import { SortFilter } from '@gamelog/game-list/filters/SortFilter';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('SortFilter', () => {
  it('renders Sort chip with current selection', () => {
    const { getByText } = render(<SortFilter sortBy="playtime" onSortChange={jest.fn()} />, {
      wrapper,
    });
    expect(getByText('Sort', { exact: false })).toBeTruthy();
    expect(getByText('Playtime')).toBeTruthy();
  });

  it('opens modal when pressed and allows selecting an option', () => {
    const onSortChange = jest.fn();
    const { getByText, queryByText } = render(
      <SortFilter sortBy="playtime" onSortChange={onSortChange} />,
      { wrapper }
    );

    // Initial state: modal should be closed
    expect(queryByText('Sort By')).toBeNull();

    // Open modal
    fireEvent.press(getByText('Sort', { exact: false }));
    expect(getByText('Sort By')).toBeTruthy();

    // Select new sort option
    fireEvent.press(getByText('Last Played'));
    expect(onSortChange).toHaveBeenCalledWith('last_played');
  });

  it('renders Sort chip with last_played selection', () => {
    const { getByText } = render(<SortFilter sortBy="last_played" onSortChange={jest.fn()} />, {
      wrapper,
    });
    expect(getByText('Last Played')).toBeTruthy();
  });

  it('renders Sort chip with max_per_day selection', () => {
    const { getByText } = render(<SortFilter sortBy="max_per_day" onSortChange={jest.fn()} />, {
      wrapper,
    });
    expect(getByText('Max per Day')).toBeTruthy();
  });

  it('renders Sort chip with top_platform selection', () => {
    const { getByText } = render(<SortFilter sortBy="top_platform" onSortChange={jest.fn()} />, {
      wrapper,
    });
    expect(getByText('Top Platform Time')).toBeTruthy();
  });

  it('renders Sort chip with unknown selection (default case)', () => {
    const { getByText } = render(
      <SortFilter sortBy={'unknown' as any} onSortChange={jest.fn()} />,
      { wrapper }
    );
    expect(getByText('Sort', { exact: false })).toBeTruthy();
  });
});
