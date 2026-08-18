import { getPlaytimeTrend } from '@gamelog/profile/playtimeTrendSelectors';

/** Fixed "today" so the trailing window resolves to known dates. 2026-08-18 is a Tuesday. */
const TODAY = new Date(2026, 7, 18);

describe('getPlaytimeTrend — window', () => {
  it('returns one entry per day, oldest first', () => {
    const trend = getPlaytimeTrend([], 14, TODAY);

    expect(trend.days).toHaveLength(14);
    expect(trend.days[0].date).toBe('2026-08-05');
    expect(trend.days[13].date).toBe('2026-08-18');
  });

  it('honours a shorter window', () => {
    const trend = getPlaytimeTrend([], 7, TODAY);

    expect(trend.days).toHaveLength(7);
    expect(trend.days[0].date).toBe('2026-08-12');
  });

  it('marks only today', () => {
    const trend = getPlaytimeTrend([], 14, TODAY);

    expect(trend.days.filter((day) => day.isToday).map((day) => day.date)).toEqual(['2026-08-18']);
  });

  it('labels each day with its weekday initial', () => {
    const trend = getPlaytimeTrend([], 7, TODAY);

    expect(trend.days.map((day) => day.label)).toEqual(['W', 'T', 'F', 'S', 'S', 'M', 'T']);
  });

  it('degrades to an empty plot rather than throwing on a nonsense window', () => {
    expect(getPlaytimeTrend([], 0, TODAY).days).toEqual([]);
    expect(getPlaytimeTrend([], -3, TODAY).days).toEqual([]);
  });
});

describe('getPlaytimeTrend — data', () => {
  it('fills unreported days with zero instead of dropping them', () => {
    const trend = getPlaytimeTrend([{ date: '2026-08-18', playtime_minutes: 60 }], 14, TODAY);

    expect(trend.days).toHaveLength(14);
    expect(trend.days[13].minutes).toBe(60);
    expect(trend.days[0].minutes).toBe(0);
  });

  it('ignores days outside the window', () => {
    const trend = getPlaytimeTrend([{ date: '2026-07-01', playtime_minutes: 600 }], 14, TODAY);

    expect(trend.hasPlaytime).toBe(false);
    expect(trend.totalLabel).toBe('0m');
  });

  it('sums two snapshots that land on the same day', () => {
    const trend = getPlaytimeTrend(
      [
        { date: '2026-08-18', playtime_minutes: 30 },
        { date: '2026-08-18', playtime_minutes: 45 },
      ],
      14,
      TODAY
    );

    expect(trend.days[13].minutes).toBe(75);
  });

  it('clamps negative minutes to zero', () => {
    const trend = getPlaytimeTrend([{ date: '2026-08-18', playtime_minutes: -90 }], 14, TODAY);

    expect(trend.days[13].minutes).toBe(0);
    expect(trend.hasPlaytime).toBe(false);
  });

  it('survives a missing series and malformed rows', () => {
    expect(getPlaytimeTrend(null, 14, TODAY).hasPlaytime).toBe(false);
    expect(getPlaytimeTrend(undefined, 14, TODAY).days).toHaveLength(14);
    expect(
      getPlaytimeTrend([{ date: '', playtime_minutes: 30 }] as any, 14, TODAY).hasPlaytime
    ).toBe(false);
    expect(getPlaytimeTrend([{ date: '2026-08-18' }] as any, 14, TODAY).days[13].minutes).toBe(0);
  });
});

describe('getPlaytimeTrend — scaling and summary', () => {
  const SERIES = [
    { date: '2026-08-16', playtime_minutes: 60 },
    { date: '2026-08-17', playtime_minutes: 120 },
    { date: '2026-08-18', playtime_minutes: 30 },
  ];

  it('scales every bar against the busiest day', () => {
    const trend = getPlaytimeTrend(SERIES, 14, TODAY);

    expect(trend.days[11].percentOfPeak).toBe(50);
    expect(trend.days[12].percentOfPeak).toBe(100);
    expect(trend.days[13].percentOfPeak).toBe(25);
    expect(trend.days[0].percentOfPeak).toBe(0);
  });

  it('leaves every bar flat when nothing was played, rather than dividing by zero', () => {
    const trend = getPlaytimeTrend([], 14, TODAY);

    expect(trend.days.every((day) => day.percentOfPeak === 0)).toBe(true);
    expect(trend.peakLabel).toBeNull();
    expect(trend.hasPlaytime).toBe(false);
  });

  it('totals the window', () => {
    expect(getPlaytimeTrend(SERIES, 14, TODAY).totalLabel).toBe('3h 30m');
  });

  it('names the busiest day', () => {
    expect(getPlaytimeTrend(SERIES, 14, TODAY).peakLabel).toBe('Mon · 2h 0m');
  });

  it('keeps the earliest day when two are tied for the peak', () => {
    const trend = getPlaytimeTrend(
      [
        { date: '2026-08-17', playtime_minutes: 60 },
        { date: '2026-08-18', playtime_minutes: 60 },
      ],
      14,
      TODAY
    );

    expect(trend.peakLabel).toBe('Mon · 1h 0m');
  });

  it('counts the days actually played', () => {
    expect(getPlaytimeTrend(SERIES, 14, TODAY).activeDaysLabel).toBe('3 of 14 days');
  });

  it('spells out the weekday for screen readers', () => {
    const trend = getPlaytimeTrend(SERIES, 14, TODAY);

    expect(trend.days[13].accessibilityLabel).toBe('Tuesday, 30m');
    expect(trend.days[0].accessibilityLabel).toBe('Wednesday, 0m');
  });

  it('defaults to a 14 day window ending today', () => {
    jest.useFakeTimers().setSystemTime(TODAY);

    const trend = getPlaytimeTrend([{ date: '2026-08-18', playtime_minutes: 60 }]);

    expect(trend.days).toHaveLength(14);
    expect(trend.days[13].isToday).toBe(true);
    jest.useRealTimers();
  });
});
