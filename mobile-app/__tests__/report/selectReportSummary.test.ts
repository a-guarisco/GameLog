import { selectReportSummary } from '@gamelog/report/selectReportSummary';

describe('selectReportSummary', () => {
  it('returns null when report is null or game_reports is empty or appliedStartDate is undefined', () => {
    expect(selectReportSummary(null, new Date(), new Date(), {})).toBeNull();
    expect(
      selectReportSummary(
        { date: '2026-08-01', game_reports: [] } as any,
        new Date(),
        new Date(),
        {}
      )
    ).toBeNull();
    expect(
      selectReportSummary(
        { date: '2026-08-01', game_reports: [{ app_id: '440', today_play_time: 10 }] } as any,
        undefined,
        new Date(),
        {}
      )
    ).toBeNull();
  });

  it('calculates summary statistics, top game name, max playtime and formatted range', () => {
    const report: any = {
      date: '2026-08-05',
      game_reports: [
        {
          app_id: '440',
          today_play_time: 120,
          max_playtime_per_day: 180,
        },
        {
          app_id: '730',
          today_play_time: 240,
          max_playtime_per_day: 300,
        },
      ],
    };

    const startDate = new Date('2026-08-01');
    const endDate = new Date('2026-08-05');

    const result = selectReportSummary(report, startDate, endDate, { '730': 'Counter-Strike 2' });

    expect(result).not.toBeNull();
    expect(result?.totalPlaytime).toBe(360);
    expect(result?.totalGames).toBe(2);
    expect(result?.topGameName).toBe('Counter-Strike 2');
    expect(result?.maxPlaytimePerDay).toBe(300);
    expect(result?.stats).toHaveLength(3);
  });

  it('handles fallback app id when top game name is not found in dictionary and endDate is undefined', () => {
    const report: any = {
      date: '2026-08-05',
      game_reports: [
        {
          app_id: '999',
          today_play_time: 50,
        },
      ],
    };

    const startDate = new Date('2026-08-01');

    const result = selectReportSummary(report, startDate, undefined, {});

    expect(result).not.toBeNull();
    expect(result?.topGameName).toBe('App ID: 999');
  });
});
