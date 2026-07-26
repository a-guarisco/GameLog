import { mergeGlobalAchievementsWithSchema } from '@gamelog/api-manager/achievementMerger';

describe('mergeGlobalAchievementsWithSchema', () => {
  it('returns original global achievements if schema is null or undefined', () => {
    const globalData = {
      achievementpercentages: { achievements: [{ name: 'ach1', percent: 50 }] },
    };
    expect(mergeGlobalAchievementsWithSchema(globalData, null)).toEqual(globalData);
    expect(mergeGlobalAchievementsWithSchema(globalData, undefined)).toEqual(globalData);
  });

  it('returns original global achievements if schema has no availableGameStats or achievements', () => {
    const globalData = {
      achievementpercentages: { achievements: [{ name: 'ach1', percent: 50 }] },
    };
    expect(
      mergeGlobalAchievementsWithSchema(globalData, {
        game: { gameName: 'TestGame', gameVersion: '1' },
      })
    ).toEqual(globalData);
  });

  it('merges displayName and description when matching name is found', () => {
    const globalData = {
      achievementpercentages: {
        achievements: [
          { name: 'PLAY_CS2', percent: 85.5 },
          { name: 'WIN_MATCH', percent: 12.3 },
        ],
      },
    };
    const schemaData = {
      game: {
        gameName: 'CS2',
        gameVersion: '1',
        availableGameStats: {
          achievements: [
            {
              name: 'PLAY_CS2',
              displayName: 'A New Beginning',
              description: 'Played first CS2 match',
            },
            { name: 'WIN_MATCH', displayName: 'Winner Winner', description: 'Won a match' },
          ],
        },
      },
    };

    const result = mergeGlobalAchievementsWithSchema(globalData, schemaData);

    expect(result).toEqual({
      achievementpercentages: {
        achievements: [
          {
            name: 'PLAY_CS2',
            percent: 85.5,
            displayName: 'A New Beginning',
            description: 'Played first CS2 match',
          },
          {
            name: 'WIN_MATCH',
            percent: 12.3,
            displayName: 'Winner Winner',
            description: 'Won a match',
          },
        ],
      },
    });
  });
});
