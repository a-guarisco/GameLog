import { render, screen } from '@testing-library/react-native';
import ProgressTrack from '@gamelog/common/game/ProgressTrack';

describe('ProgressTrack', () => {
  it('sizes the fill to the percentage', () => {
    render(<ProgressTrack percent={42} testID="fill" />);

    expect(screen.getByTestId('fill').props.style).toEqual(
      expect.objectContaining({ width: '42%' })
    );
  });

  it('clamps values outside 0-100 so the fill never overflows the track', () => {
    render(<ProgressTrack percent={140} testID="over" />);
    expect(screen.getByTestId('over').props.style).toEqual(
      expect.objectContaining({ width: '100%' })
    );

    render(<ProgressTrack percent={-10} testID="under" />);
    expect(screen.getByTestId('under').props.style).toEqual(
      expect.objectContaining({ width: '0%' })
    );
  });

  it('lets the caller recolour the fill', () => {
    render(<ProgressTrack percent={10} fillClassName="bg-success-500" testID="fill" />);

    expect(screen.getByTestId('fill').props.className).toContain('bg-success-500');
  });
});
