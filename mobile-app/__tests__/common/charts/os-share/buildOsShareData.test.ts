import buildOsShareData from '@gamelog/common/charts/os-share/buildOsShareData';
import { OS_COLORS } from '@gamelog/common/charts/chartsHelpers';
import { GameItem } from '@gamelog/api-manager/dto';

jest.mock('@gamelog/common/charts/chartsHelpers', () => ({
  OS_COLORS: {
    Windows: { color: '#win', gradientCenterColor: '#win-g' },
    Mac: { color: '#mac', gradientCenterColor: '#mac-g' },
    Linux: { color: '#lnx', gradientCenterColor: '#lnx-g' },
    'Steam Deck': { color: '#sdk', gradientCenterColor: '#sdk-g' },
  },
}));

const makeGame = (overrides: Partial<GameItem> = {}): GameItem => ({
  appid: '1',
  name: 'Test Game',
  playtime_forever: 0,
  img_icon_url: '',
  has_community_visible_stats: false,
  playtime_windows_forever: 0,
  playtime_mac_forever: 0,
  playtime_linux_forever: 0,
  playtime_deck_forever: 0,
  rtime_last_played: 0,
  ...overrides,
});

describe('buildOsShareData', () => {
  it('returns an empty array when all platforms have zero playtime', () => {
    const result = buildOsShareData([makeGame()]);
    expect(result).toEqual([]);
  });

  it('returns an empty array for an empty games list', () => {
    expect(buildOsShareData([])).toEqual([]);
  });

  it('filters out platforms with zero total playtime', () => {
    const result = buildOsShareData([makeGame({ playtime_windows_forever: 120 })]);
    expect(result.map((r) => r.text)).not.toEqual(
      expect.arrayContaining([expect.stringContaining('Mac')])
    );
    expect(result.map((r) => r.text)).not.toEqual(
      expect.arrayContaining([expect.stringContaining('Linux')])
    );
  });

  it('converts minutes to truncated hours in the value field', () => {
    const result = buildOsShareData([makeGame({ playtime_windows_forever: 150 })]);
    expect(result[0].value).toBe(2); // Math.trunc(150 / 60)
  });

  it('formats the text label as "Platform: Xh"', () => {
    const result = buildOsShareData([makeGame({ playtime_windows_forever: 120 })]);
    expect(result[0].text).toBe('Windows: 2h');
  });

  it('accumulates playtime across multiple games for the same platform', () => {
    const games = [
      makeGame({ playtime_windows_forever: 60 }),
      makeGame({ playtime_windows_forever: 60 }),
    ];
    const result = buildOsShareData(games);
    expect(result[0].value).toBe(2);
  });

  it('spreads OS_COLORS for the matching platform onto each item', () => {
    const result = buildOsShareData([makeGame({ playtime_windows_forever: 60 })]);
    expect(result[0]).toMatchObject(OS_COLORS['Windows']);
  });

  it('returns one entry per platform that has playtime > 0', () => {
    const games = [
      makeGame({
        playtime_windows_forever: 60,
        playtime_mac_forever: 30,
        playtime_linux_forever: 0,
        playtime_deck_forever: 90,
      }),
    ];
    const result = buildOsShareData(games);
    expect(result).toHaveLength(3);
    const platforms = result.map((r) => r.text.split(':')[0]);
    expect(platforms).toEqual(expect.arrayContaining(['Windows', 'Mac', 'Steam Deck']));
    expect(platforms).not.toContain('Linux');
  });

  it('treats missing playtime fields as 0 via nullish coalescing', () => {
    const game = makeGame({ playtime_windows_forever: undefined as any });
    expect(() => buildOsShareData([game])).not.toThrow();
    expect(buildOsShareData([game])).toEqual([]);
  });

  it('truncates fractional hours rather than rounding', () => {
    const result = buildOsShareData([makeGame({ playtime_windows_forever: 119 })]);
    expect(result[0].value).toBe(1);
    expect(result[0].text).toBe('Windows: 1h');
  });
});
