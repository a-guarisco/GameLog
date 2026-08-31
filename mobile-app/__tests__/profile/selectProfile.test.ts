import {
  selectMemberSinceLabel,
  selectMostPlayedGame,
  selectProfileStats,
  selectTopGamesByHours,
} from '@gamelog/profile/selectProfile';
import type { OwnedGames } from '@gamelog/api-manager/dto';

const buildGame = (overrides: Record<string, unknown> = {}) =>
  ({
    appid: '236390',
    name: 'War Thunder',
    playtime_forever: 24750,
    img_icon_url: '',
    has_community_visible_stats: true,
    playtime_windows_forever: 24750,
    playtime_mac_forever: 0,
    playtime_linux_forever: 0,
    playtime_deck_forever: 0,
    rtime_last_played: 1785334609,
    ...overrides,
  }) as OwnedGames['response']['games'][0];

const buildOwnedGames = (
  games: ReturnType<typeof buildGame>[],
  gameCount?: number
): OwnedGames => ({ response: { game_count: gameCount ?? games.length, games } });

const LIBRARY = buildOwnedGames([
  buildGame({ appid: '730', name: 'Counter-Strike 2', playtime_forever: 16092 }),
  buildGame({ appid: '236390', name: 'War Thunder', playtime_forever: 24750 }),
  buildGame({ appid: '570', name: 'Dota 2', playtime_forever: 11460 }),
  buildGame({ appid: '620', name: 'Portal 2', playtime_forever: 0 }),
]);

describe('selectMostPlayedGame', () => {
  it('returns the game with the highest lifetime playtime', () => {
    expect(selectMostPlayedGame(LIBRARY)?.name).toBe('War Thunder');
  });

  it('returns null for an empty library', () => {
    expect(selectMostPlayedGame(buildOwnedGames([]))).toBeNull();
  });

  it('returns null when there is no payload at all', () => {
    expect(selectMostPlayedGame(null)).toBeNull();
    expect(selectMostPlayedGame(undefined)).toBeNull();
  });
});

describe('selectProfileStats', () => {
  it('reports owned, recently played and total hours', () => {
    const stats = selectProfileStats(
      buildOwnedGames([
        buildGame({ appid: '730', playtime_forever: 60 }),
        buildGame({ appid: '570', playtime_forever: 120 }),
      ]),
      150
    );

    expect(stats).toEqual([
      { value: '2', label: 'Owned' },
      { value: '2 h', label: '2 weeks' },
      { value: '3 h', label: 'Total' },
    ]);
  });

  it('truncates the two-week window to whole hours and groups thousands', () => {
    const library = buildOwnedGames([buildGame()]);

    expect(selectProfileStats(library, 59)[1]).toEqual({ value: '0 h', label: '2 weeks' });
    expect(selectProfileStats(library, 119)[1]).toEqual({ value: '1 h', label: '2 weeks' });
    expect(selectProfileStats(library, 60 * 1234)[1]).toEqual({
      value: '1,234 h',
      label: '2 weeks',
    });
  });

  it('reports no recent hours when the report has not been passed in', () => {
    expect(selectProfileStats(buildOwnedGames([buildGame()]))[1]).toEqual({
      value: '0 h',
      label: '2 weeks',
    });
  });

  it('prefers the authoritative game_count over the returned page of games', () => {
    const stats = selectProfileStats(buildOwnedGames([buildGame()], 160));

    expect(stats[0]).toEqual({ value: '160', label: 'Owned' });
  });

  it('groups thousands in the total hours', () => {
    const stats = selectProfileStats(buildOwnedGames([buildGame({ playtime_forever: 86280 })]));

    expect(stats[2]).toEqual({ value: '1,438 h', label: 'Total' });
  });

  it('treats a game with no reported playtime as zero hours', () => {
    const stats = selectProfileStats(
      buildOwnedGames([buildGame({ playtime_forever: undefined }), buildGame()])
    );

    expect(stats[2]).toEqual({ value: '412 h', label: 'Total' });
  });

  it('falls back to zeroes when there is no library', () => {
    expect(selectProfileStats(null)).toEqual([
      { value: '0', label: 'Owned' },
      { value: '0 h', label: '2 weeks' },
      { value: '0 h', label: 'Total' },
    ]);
  });
});

describe('selectTopGamesByHours', () => {
  it('ranks games by playtime, highest first', () => {
    expect(selectTopGamesByHours(LIBRARY).map((game) => game.name)).toEqual([
      'War Thunder',
      'Counter-Strike 2',
      'Dota 2',
    ]);
  });

  it('fills the track for the top game and scales the rest against it', () => {
    const [top, second] = selectTopGamesByHours(LIBRARY);

    expect(top.percentOfTop).toBe(100);
    expect(second.percentOfTop).toBeCloseTo(65.02, 1);
  });

  it('labels each row with the short hours format', () => {
    expect(selectTopGamesByHours(LIBRARY)[0].hoursLabel).toBe('412h');
  });

  it('drops never-played games rather than showing empty tracks', () => {
    expect(selectTopGamesByHours(LIBRARY).map((game) => game.appid)).not.toContain('620');
  });

  it('caps the list at five games by default', () => {
    const many = buildOwnedGames(
      Array.from({ length: 8 }, (_, i) =>
        buildGame({ appid: `${i}`, name: `Game ${i}`, playtime_forever: (i + 1) * 60 })
      )
    );

    expect(selectTopGamesByHours(many)).toHaveLength(5);
  });

  it('honours an explicit limit', () => {
    expect(selectTopGamesByHours(LIBRARY, 2)).toHaveLength(2);
    expect(selectTopGamesByHours(LIBRARY, 0)).toEqual([]);
  });

  it('drops a game with no reported playtime', () => {
    const games = selectTopGamesByHours(
      buildOwnedGames([buildGame({ appid: '620', playtime_forever: undefined }), buildGame()])
    );

    expect(games.map((game) => game.appid)).toEqual(['236390']);
  });

  it('returns an empty list when nothing has been played', () => {
    expect(selectTopGamesByHours(buildOwnedGames([buildGame({ playtime_forever: 0 })]))).toEqual(
      []
    );
    expect(selectTopGamesByHours(null)).toEqual([]);
  });
});

describe('selectMemberSinceLabel', () => {
  it('turns the Steam creation timestamp into a year', () => {
    expect(selectMemberSinceLabel(Date.UTC(2011, 6, 4) / 1000)).toBe('Since 2011');
  });

  it('has no label when Steam does not report a creation date', () => {
    expect(selectMemberSinceLabel(undefined)).toBeNull();
    expect(selectMemberSinceLabel(null)).toBeNull();
    expect(selectMemberSinceLabel(0)).toBeNull();
  });
});
