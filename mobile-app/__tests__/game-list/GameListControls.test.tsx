import { render } from '@testing-library/react-native';
import { GameListControls } from '@gamelog/game-list/GameListControls';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('GameListControls', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    sortBy: 'playtime' as const,
    onSortChange: jest.fn(),
    genreFilter: 'All',
    setGenreFilter: jest.fn(),
    statusFilter: 'All' as const,
    setStatusFilter: jest.fn(),
    platformFilter: 'All' as const,
    setPlatformFilter: jest.fn(),
    dateRangeFilter: { start: null, end: null },
    setDateRangeFilter: jest.fn(),
    allAvailableGenres: ['Action', 'RPG'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter components', () => {
    const { getByText } = render(<GameListControls {...mockProps} />, { wrapper });

    expect(getByText('Sort', { exact: false })).toBeTruthy();
    expect(getByText('Genre', { exact: false })).toBeTruthy();
    expect(getByText('Status', { exact: false })).toBeTruthy();
    expect(getByText('Platform', { exact: false })).toBeTruthy();
    expect(getByText('Date', { exact: false })).toBeTruthy();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<GameListControls {...mockProps} />, { wrapper });
    expect(getByPlaceholderText('Search games...')).toBeTruthy();
  });
});
