import {
  formatAchievementName,
  formatMinutesToHours,
  formatShortDate,
  formatShortDateWithYear,
  formatThousands,
  toIsoDate,
} from '@gamelog/utils/formatUtils';

describe('formatAchievementName', () => {
  it('replaces underscores with spaces', () => {
    expect(formatAchievementName('ACHIEVE_QUEST_COMPLETE')).toBe('ACHIEVE QUEST COMPLETE');
  });
});

describe('formatMinutesToHours', () => {
  it('formats minutes under 60 as Xm', () => {
    expect(formatMinutesToHours(45)).toBe('45m');
  });

  it('formats exact hours correctly', () => {
    expect(formatMinutesToHours(120)).toBe('2h 0m');
  });

  it('formats hours and minutes correctly', () => {
    expect(formatMinutesToHours(135)).toBe('2h 15m');
  });

  it('formats zero minutes', () => {
    expect(formatMinutesToHours(0)).toBe('0m');
  });

  it('handles large values', () => {
    expect(formatMinutesToHours(600)).toBe('10h 0m');
  });
});

describe('formatShortDate', () => {
  it('renders a steam unix timestamp as month and day', () => {
    const timestamp = 1784660983;
    expect(formatShortDate(timestamp)).toBe(
      new Date(timestamp * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    );
  });
});

describe('formatShortDateWithYear', () => {
  it('renders a steam unix timestamp as month, day and year', () => {
    const timestamp = 1784660983;
    expect(formatShortDateWithYear(timestamp)).toBe(
      new Date(timestamp * 1000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  });

  it('includes the year, unlike formatShortDate', () => {
    const timestamp = 1784660983;
    const year = new Date(timestamp * 1000).getFullYear().toString();

    expect(formatShortDateWithYear(timestamp)).toContain(year);
    expect(formatShortDate(timestamp)).not.toContain(year);
  });
});

describe('toIsoDate', () => {
  it('formats a date from its local calendar fields', () => {
    expect(toIsoDate(new Date(2026, 7, 18, 23, 45))).toBe('2026-08-18');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('keeps the local day late in the evening, where toISOString() would roll over', () => {
    const late = new Date(2026, 11, 31, 23, 59);

    expect(toIsoDate(late)).toBe('2026-12-31');
  });
});

describe('formatThousands', () => {
  it('groups thousands and leaves short numbers alone', () => {
    expect(formatThousands(412249)).toBe('412,249');
    expect(formatThousands(999)).toBe('999');
  });
});
