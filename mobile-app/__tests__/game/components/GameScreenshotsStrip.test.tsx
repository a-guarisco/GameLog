import { render, screen, fireEvent } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import GameScreenshotsStrip, { GameScreenshot } from '@gamelog/game/GameScreenshotsStrip';

const screenshots: GameScreenshot[] = [
  { id: '1', imageUrl: 'https://images.steamusercontent.com/ugc/1/', caption: 'First light' },
  { id: '2', imageUrl: 'https://images.steamusercontent.com/ugc/2/', caption: 'Harvest day' },
];

const scrollTo = (x: number, contentWidth: number) => ({
  nativeEvent: {
    contentOffset: { x, y: 0 },
    layoutMeasurement: { width: 390, height: 99 },
    contentSize: { width: contentWidth, height: 99 },
  },
});

describe('GameScreenshotsStrip', () => {
  it('renders one caption per screenshot and the grouped total', () => {
    render(<GameScreenshotsStrip screenshots={screenshots} totalCount={412249} />);

    expect(screen.getByText('First light')).toBeTruthy();
    expect(screen.getByText('Harvest day')).toBeTruthy();
    expect(screen.getByText('412,249 total')).toBeTruthy();
  });

  it('hides the total until the count is known', () => {
    render(<GameScreenshotsStrip screenshots={screenshots} totalCount={0} />);

    expect(screen.queryByText('0 total')).toBeNull();
  });

  it('asks for the next page only once the scroll nears the end', () => {
    const onEndReached = jest.fn();
    render(
      <GameScreenshotsStrip screenshots={screenshots} totalCount={10} onEndReached={onEndReached} />
    );

    const scrollView = screen.UNSAFE_getByType(ScrollView);

    fireEvent.scroll(scrollView, scrollTo(0, 2000));
    expect(onEndReached).not.toHaveBeenCalled();

    fireEvent.scroll(scrollView, scrollTo(1500, 2000));
    expect(onEndReached).toHaveBeenCalled();
  });
});
