import { render, screen } from '@testing-library/react-native';
import ScreenshotTile, { GameScreenshot } from '@gamelog/game/ScreenshotTile';

describe('ScreenshotTile', () => {
  const sampleScreenshot: GameScreenshot = {
    id: 'shot-1',
    imageUrl: 'https://example.com/screenshot.jpg',
    caption: 'Awesome In-Game Moment',
  };

  it('renders caption text', () => {
    render(<ScreenshotTile screenshot={sampleScreenshot} />);
    expect(screen.getByText('Awesome In-Game Moment')).toBeTruthy();
  });
});
