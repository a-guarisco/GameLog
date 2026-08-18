import { render, screen } from '@testing-library/react-native';
import GameStatBand from '@gamelog/game/GameStatBand';

const stats = [
  { value: '120h', label: 'Total' },
  { value: '—', label: '2 weeks' },
  { value: 'Mar 16, 2026', label: 'Last played' },
];

describe('GameStatBand', () => {
  it('renders every stat value and label', () => {
    render(<GameStatBand stats={stats} />);

    stats.forEach((stat) => {
      expect(screen.getByText(stat.value)).toBeTruthy();
      expect(screen.getByText(stat.label)).toBeTruthy();
    });
  });

  it('lets a long value wrap onto a second line instead of truncating it', () => {
    render(<GameStatBand stats={stats} />);

    expect(screen.getByText('Mar 16, 2026').props.numberOfLines).toBe(2);
  });

  it('keeps labels on a single line', () => {
    render(<GameStatBand stats={stats} />);

    expect(screen.getByText('Last played').props.numberOfLines).toBe(1);
  });

  it('renders nothing when there are no stats', () => {
    render(<GameStatBand stats={[]} />);

    expect(screen.queryByText('Total')).toBeNull();
  });
});
