import { formatMinutesToHours } from '@gamelog/utils/formatUtils';

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
