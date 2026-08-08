import { GlobalAchievement, PlayerAchievement } from '@gamelog/api-manager/dto';
import mergeGlobalPersonalAchievements from '@gamelog/game/mergeGlobalPersonalAchievements';

const buildGlobalAchievements = (
  achievements: GlobalAchievement['achievementpercentages']['achievements']
): GlobalAchievement => ({
  achievementpercentages: { achievements },
});

const buildPersonalAchievements = (
  achievements: PlayerAchievement['playerstats']['achievements']
): PlayerAchievement => ({
  playerstats: {
    steamID: 'steam-user',
    gameName: 'Test Game',
    achievements,
    success: true,
  },
});

describe('mergeGlobalPersonalAchievements', () => {
  it('returns an empty list when global achievements are missing', () => {
    expect(mergeGlobalPersonalAchievements(undefined, undefined)).toEqual([]);
    expect(
      mergeGlobalPersonalAchievements({} as GlobalAchievement, buildPersonalAchievements([]))
    ).toEqual([]);
    expect(
      mergeGlobalPersonalAchievements(
        { achievementpercentages: {} } as GlobalAchievement,
        buildPersonalAchievements([])
      )
    ).toEqual([]);
  });

  it('returns an empty list when the global achievement list is empty', () => {
    expect(mergeGlobalPersonalAchievements(buildGlobalAchievements([]), undefined)).toEqual([]);
  });

  it('maps global achievements without personal data and defaults optional text fields', () => {
    const globalAchievements = buildGlobalAchievements([
      { name: 'WIN_MATCH', percent: 12.3, displayName: 'Winner', description: 'Win once' },
      { name: 'PLAY_GAME', percent: 85.5 },
    ]);

    expect(mergeGlobalPersonalAchievements(globalAchievements, undefined)).toEqual([
      {
        name: 'WIN_MATCH',
        displayName: 'Winner',
        percent: 12.3,
        description: 'Win once',
        unlockTime: undefined,
      },
      {
        name: 'PLAY_GAME',
        displayName: '',
        percent: 85.5,
        description: '',
        unlockTime: undefined,
      },
    ]);
  });

  it('adds unlockTime only when the matching personal achievement is achieved', () => {
    const globalAchievements = buildGlobalAchievements([
      { name: 'ACHIEVED_ONE', percent: 50, displayName: 'Done' },
      { name: 'LOCKED_ONE', percent: 10, displayName: 'Not Done' },
      { name: 'MISSING_PERSONAL', percent: 20, displayName: 'Missing' },
    ]);
    const personalAchievements = buildPersonalAchievements([
      { apiname: 'ACHIEVED_ONE', achieved: 1, unlocktime: 1234567890 },
      { apiname: 'LOCKED_ONE', achieved: 0, unlocktime: 9876543210 },
      { apiname: 'UNRELATED', achieved: 1, unlocktime: 1111111111 },
    ]);

    expect(mergeGlobalPersonalAchievements(globalAchievements, personalAchievements)).toEqual([
      {
        name: 'ACHIEVED_ONE',
        displayName: 'Done',
        percent: 50,
        description: '',
        unlockTime: 1234567890,
      },
      {
        name: 'LOCKED_ONE',
        displayName: 'Not Done',
        percent: 10,
        description: '',
        unlockTime: undefined,
      },
      {
        name: 'MISSING_PERSONAL',
        displayName: 'Missing',
        percent: 20,
        description: '',
        unlockTime: undefined,
      },
    ]);
  });

  it('sorts unlocked achievements first, then sorts each group by global percent ascending', () => {
    const globalAchievements = buildGlobalAchievements([
      { name: 'LOCKED_RARE', percent: 2 },
      { name: 'UNLOCKED_COMMON', percent: 90 },
      { name: 'UNLOCKED_RARE', percent: 5 },
      { name: 'LOCKED_COMMON', percent: 70 },
    ]);
    const personalAchievements = buildPersonalAchievements([
      { apiname: 'UNLOCKED_COMMON', achieved: 1, unlocktime: 200 },
      { apiname: 'UNLOCKED_RARE', achieved: 1, unlocktime: 100 },
    ]);

    expect(
      mergeGlobalPersonalAchievements(globalAchievements, personalAchievements).map(
        (achievement) => achievement.name
      )
    ).toEqual(['UNLOCKED_RARE', 'UNLOCKED_COMMON', 'LOCKED_RARE', 'LOCKED_COMMON']);
  });

  it('handles personal achievement data without an achievements list', () => {
    const globalAchievements = buildGlobalAchievements([{ name: 'ACH_ONE', percent: 25 }]);

    expect(
      mergeGlobalPersonalAchievements(globalAchievements, { playerstats: {} } as PlayerAchievement)
    ).toEqual([
      {
        name: 'ACH_ONE',
        displayName: '',
        percent: 25,
        description: '',
        unlockTime: undefined,
      },
    ]);
  });

  it('does not mutate global or personal achievement inputs', () => {
    const globalAchievements = buildGlobalAchievements([
      { name: 'ACH_ONE', percent: 25, displayName: 'Achievement One' },
    ]);
    const personalAchievements = buildPersonalAchievements([
      { apiname: 'ACH_ONE', achieved: 1, unlocktime: 500 },
    ]);
    const originalGlobalAchievements = JSON.parse(JSON.stringify(globalAchievements));
    const originalPersonalAchievements = JSON.parse(JSON.stringify(personalAchievements));

    mergeGlobalPersonalAchievements(globalAchievements, personalAchievements);

    expect(globalAchievements).toEqual(originalGlobalAchievements);
    expect(personalAchievements).toEqual(originalPersonalAchievements);
  });
});
