import {
  getReportMinutesForGame,
  getReportTotalMinutes,
} from '@gamelog/common/selectPlaytimeReport';
import type { DailyReport } from '@gamelog/api-manager/dto';

const REPORT: DailyReport = {
  date: '2026-08-18',
  game_reports: [
    { app_id: '236390', today_play_time: 240, streak: 3 },
    { app_id: '730', today_play_time: 65, streak: 1 },
  ],
};

const EMPTY_REPORT: DailyReport = { date: '2026-08-18', game_reports: [] };

describe('getReportTotalMinutes', () => {
  it('sums every game in the window', () => {
    expect(getReportTotalMinutes(REPORT)).toBe(305);
  });

  it('is zero for an empty or missing report', () => {
    expect(getReportTotalMinutes(EMPTY_REPORT)).toBe(0);
    expect(getReportTotalMinutes(null)).toBe(0);
    expect(getReportTotalMinutes(undefined)).toBe(0);
  });

  it('treats a game with no reported minutes as zero', () => {
    const report = {
      date: '2026-08-18',
      game_reports: [{ app_id: '570', streak: 0 }],
    } as unknown as DailyReport;

    expect(getReportTotalMinutes(report)).toBe(0);
  });
});

describe('getReportMinutesForGame', () => {
  it('picks out the minutes for one game', () => {
    expect(getReportMinutesForGame(REPORT, '730')).toBe(65);
  });

  it('matches a numeric app id against the string the backend sends', () => {
    expect(getReportMinutesForGame(REPORT, 236390)).toBe(240);
  });

  it('is zero for a game the user did not touch in the window', () => {
    expect(getReportMinutesForGame(REPORT, '570')).toBe(0);
    expect(getReportMinutesForGame(EMPTY_REPORT, '730')).toBe(0);
    expect(getReportMinutesForGame(null, '730')).toBe(0);
    expect(getReportMinutesForGame(undefined, '730')).toBe(0);
  });
});
