import { getPlatformSplit } from '@gamelog/profile/platformSplitSelectors';
import type { OwnedGames } from '@gamelog/api-manager/dto';

const makeGame = (overrides: Record<string, number> = {}) =>
  ({
    appid: '236390',
    name: 'War Thunder',
    playtime_forever: 0,
    img_icon_url: '',
    has_community_visible_stats: true,
    playtime_windows_forever: 0,
    playtime_mac_forever: 0,
    playtime_linux_forever: 0,
    playtime_deck_forever: 0,
    rtime_last_played: 0,
    ...overrides,
  }) as OwnedGames['response']['games'][number];

const makeLibrary = (games: OwnedGames['response']['games']): OwnedGames => ({
  response: { game_count: games.length, games },
});

describe('getPlatformSplit', () => {
  it('sums each platform across the library and ranks them', () => {
    const split = getPlatformSplit(
      makeLibrary([
        makeGame({ playtime_windows_forever: 600, playtime_linux_forever: 120 }),
        makeGame({ playtime_windows_forever: 600, playtime_deck_forever: 300 }),
      ])
    );

    expect(split.shares.map((share) => share.id)).toEqual(['windows', 'deck', 'linux']);
    expect(split.shares[0].minutes).toBe(1200);
  });

  it('drops platforms that were never played', () => {
    const split = getPlatformSplit(makeLibrary([makeGame({ playtime_windows_forever: 600 })]));

    expect(split.shares).toHaveLength(1);
    expect(split.shares[0].name).toBe('Windows');
  });

  it('gives each platform its share of the total', () => {
    const split = getPlatformSplit(
      makeLibrary([makeGame({ playtime_windows_forever: 750, playtime_deck_forever: 250 })])
    );

    expect(split.shares[0].percent).toBe(75);
    expect(split.shares[0].percentLabel).toBe('75%');
    expect(split.shares[1].percentLabel).toBe('25%');
  });

  it('never rounds a played platform down to 0%', () => {
    const split = getPlatformSplit(
      makeLibrary([makeGame({ playtime_windows_forever: 100000, playtime_mac_forever: 60 })])
    );

    expect(split.shares[1].percentLabel).toBe('<1%');
  });

  it('groups the thousands in every hour label', () => {
    const split = getPlatformSplit(makeLibrary([makeGame({ playtime_windows_forever: 69120 })]));

    expect(split.shares[0].hoursLabel).toBe('1,152h');
    expect(split.totalLabel).toBe('1,152h');
  });

  it('carries an icon per platform', () => {
    const split = getPlatformSplit(
      makeLibrary([
        makeGame({
          playtime_windows_forever: 40,
          playtime_mac_forever: 30,
          playtime_linux_forever: 20,
          playtime_deck_forever: 10,
        }),
      ])
    );

    expect(split.shares.map((share) => share.icon)).toEqual([
      'logo-windows',
      'logo-apple',
      'logo-tux',
      'logo-steam',
    ]);
  });

  it('ignores negative playtime rather than subtracting it from the total', () => {
    const split = getPlatformSplit(
      makeLibrary([makeGame({ playtime_windows_forever: 600, playtime_mac_forever: -600 })])
    );

    expect(split.shares).toHaveLength(1);
    expect(split.totalLabel).toBe('10h');
  });

  it('reports an empty library without dividing by zero', () => {
    const split = getPlatformSplit(makeLibrary([]));

    expect(split.shares).toEqual([]);
    expect(split.hasPlaytime).toBe(false);
    expect(split.totalLabel).toBe('0h');
  });

  it('survives a library that never arrived', () => {
    expect(getPlatformSplit(null).hasPlaytime).toBe(false);
    expect(getPlatformSplit(undefined).shares).toEqual([]);
    expect(getPlatformSplit({} as OwnedGames).hasPlaytime).toBe(false);
  });

  it('treats missing per-platform fields as zero', () => {
    const split = getPlatformSplit(makeLibrary([{ playtime_windows_forever: 600 } as any]));

    expect(split.shares).toHaveLength(1);
    expect(split.shares[0].percent).toBe(100);
  });
});
