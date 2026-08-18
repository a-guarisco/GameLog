import { render, screen } from '@testing-library/react-native';
import ProfilePlaytimeTrend from '@gamelog/profile/ProfilePlaytimeTrend';
import { getPlaytimeTrend } from '@gamelog/profile/playtimeTrendSelectors';

const TODAY = new Date(2026, 7, 18);

const buildTrend = (series: { date: string; playtime_minutes: number }[], days = 14) =>
  getPlaytimeTrend(series, days, TODAY);

const TREND = buildTrend([
  { date: '2026-08-16', playtime_minutes: 60 },
  { date: '2026-08-17', playtime_minutes: 120 },
  { date: '2026-08-18', playtime_minutes: 30 },
]);

describe('ProfilePlaytimeTrend', () => {
  it('labels the block with the window it covers', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByText('Playtime · last 14 days')).toBeTruthy();
  });

  it('leads with the window total and the busiest day', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByText('3h 30m')).toBeTruthy();
    expect(screen.getByText('peak Mon · 2h 0m')).toBeTruthy();
    expect(screen.getByText('Played 3 of 14 days.')).toBeTruthy();
  });

  it('draws one bar per day of the window', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByTestId('profile-trend-bar-2026-08-05')).toBeTruthy();
    expect(screen.getByTestId('profile-trend-bar-2026-08-18')).toBeTruthy();
  });

  it('sizes each bar against the busiest day', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByTestId('profile-trend-bar-2026-08-17').props.style).toEqual(
      expect.objectContaining({ height: '100%' })
    );
    expect(screen.getByTestId('profile-trend-bar-2026-08-16').props.style).toEqual(
      expect.objectContaining({ height: '50%' })
    );
  });

  it('keeps a barely-played day visible instead of collapsing it onto the axis', () => {
    const trend = buildTrend([
      { date: '2026-08-17', playtime_minutes: 600 },
      { date: '2026-08-18', playtime_minutes: 1 },
    ]);

    render(<ProfilePlaytimeTrend trend={trend} />);

    expect(screen.getByTestId('profile-trend-bar-2026-08-18').props.style).toEqual(
      expect.objectContaining({ height: '6%' })
    );
  });

  it('draws an unplayed day as a flat tick with no height of its own', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByTestId('profile-trend-bar-2026-08-05').props.style).toBeUndefined();
  });

  it('spells out each day for screen readers', () => {
    render(<ProfilePlaytimeTrend trend={TREND} />);

    expect(screen.getByLabelText('Tuesday, 30m')).toBeTruthy();
  });

  it('explains an idle window instead of showing a flat plot', () => {
    render(<ProfilePlaytimeTrend trend={buildTrend([])} />);

    expect(screen.getByText('No playtime in this window')).toBeTruthy();
    expect(screen.queryByTestId('profile-trend-bar-2026-08-18')).toBeNull();
  });

  it('says the history failed rather than claiming nothing was played', () => {
    render(<ProfilePlaytimeTrend trend={TREND} hasError />);

    expect(screen.getByText('Could not load playtime history')).toBeTruthy();
    expect(screen.queryByText('No playtime in this window')).toBeNull();
    expect(screen.queryByTestId('profile-trend-bar-2026-08-18')).toBeNull();
  });

  it('drops the peak caption when there is nothing to call a peak', () => {
    const trend = { ...buildTrend([]), hasPlaytime: true, totalLabel: '0m' };

    render(<ProfilePlaytimeTrend trend={trend} />);

    expect(screen.queryByText(/^peak/)).toBeNull();
    expect(screen.getByText('0m')).toBeTruthy();
  });
});
