import { render, screen } from '@testing-library/react-native';
import GameScreenshotsGrid from '@gamelog/game/GameScreenshotsGrid';

describe('GameScreenshotsGrid', () => {
  const mockScreenshots = [
    { id: '1', imageUrl: 'https://example.com/1.jpg', caption: 'First shot' },
    { id: '2', imageUrl: 'https://example.com/2.jpg', caption: 'Second shot' },
  ];

  it('renders screenshots and header', () => {
    render(<GameScreenshotsGrid screenshots={mockScreenshots} totalCount={2} />);

    expect(screen.getByText('Community in-game screenshots')).toBeTruthy();
    expect(screen.getByText('2 total')).toBeTruthy();
    expect(screen.getByText('First shot')).toBeTruthy();
    expect(screen.getByText('Second shot')).toBeTruthy();
  });

  it('renders loading spinner when loading initially', () => {
    render(<GameScreenshotsGrid screenshots={[]} totalCount={0} isLoading={true} />);

    expect(screen.getByTestId('section-spinner')).toBeTruthy();
  });

  it('renders loading more spinner when isLoadingMore is true', () => {
    render(
      <GameScreenshotsGrid screenshots={mockScreenshots} totalCount={2} isLoadingMore={true} />
    );

    expect(screen.getByTestId('section-spinner')).toBeTruthy();
  });
});
