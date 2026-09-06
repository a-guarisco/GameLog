import { render, fireEvent } from '@testing-library/react-native';
import GameCapsuleImage from '@gamelog/common/GameCapsuleImage';

describe('GameCapsuleImage', () => {
  it('renders correctly with default dimensions and starts in loading state with shimmer and no fallback icon', () => {
    const { getByTestId, queryByTestId } = render(<GameCapsuleImage appId="42" />);

    expect(getByTestId('game-capsule-42')).toBeTruthy();
    expect(getByTestId('game-capsule-42-img')).toBeTruthy();
    expect(getByTestId('game-capsule-42-shimmer')).toBeTruthy();
    expect(queryByTestId('game-capsule-42-fallback-icon')).toBeNull();
  });

  it('removes shimmer and reveals image when image loads successfully without fallback icon', () => {
    const { getByTestId, queryByTestId } = render(<GameCapsuleImage appId="42" />);

    const img = getByTestId('game-capsule-42-img');
    fireEvent(img, 'load');

    expect(queryByTestId('game-capsule-42-shimmer')).toBeNull();
    expect(getByTestId('game-capsule-42-img')).toBeTruthy();
    expect(queryByTestId('game-capsule-42-fallback-icon')).toBeNull();
  });

  it('removes shimmer, hides broken image, and renders the game controller fallback icon on error', () => {
    const { getByTestId, queryByTestId } = render(<GameCapsuleImage appId="42" />);

    const img = getByTestId('game-capsule-42-img');
    fireEvent(img, 'error');

    expect(queryByTestId('game-capsule-42-shimmer')).toBeNull();
    expect(queryByTestId('game-capsule-42-img')).toBeNull();
    expect(getByTestId('game-capsule-42-fallback-icon')).toBeTruthy();
  });

  it('renders the game controller fallback icon immediately if no image is available', () => {
    const { getByTestId, queryByTestId } = render(<GameCapsuleImage testID="empty-capsule" />);

    expect(getByTestId('empty-capsule')).toBeTruthy();
    expect(queryByTestId('empty-capsule-shimmer')).toBeNull();
    expect(queryByTestId('empty-capsule-img')).toBeNull();
    expect(getByTestId('empty-capsule-fallback-icon')).toBeTruthy();
  });

  it('supports custom testID and dimensions', () => {
    const { getByTestId } = render(
      <GameCapsuleImage appId="100" testID="custom-capsule" width={100} height={60} />
    );

    const container = getByTestId('custom-capsule');
    expect(container).toBeTruthy();
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 100,
          height: 60,
        }),
      ])
    );
  });
});
