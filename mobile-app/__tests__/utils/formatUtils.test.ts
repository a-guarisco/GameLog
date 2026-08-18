import {
  formatAchievementName,
  formatMinutesToHours,
  formatShortDate,
  formatThousands,
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

describe('formatThousands', () => {
  it('groups thousands and leaves short numbers alone', () => {
    expect(formatThousands(412249)).toBe('412,249');
    expect(formatThousands(999)).toBe('999');
  });
});
