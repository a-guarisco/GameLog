import { getGuideTopicTags, getGuideUrl, MAX_GUIDE_TAGS } from '@gamelog/game/guideTags';
import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

const buildGuide = (tags?: { tag: string; display_name: string }[]) =>
  ({ publishedfileid: '638260986', tags }) as PublishedFileDetails;

const asTags = (displayNames: string[]) =>
  displayNames.map((display_name) => ({ tag: display_name, display_name }));

describe('getGuideTopicTags', () => {
  it('keeps the first three topical tags in the order steam sends them', () => {
    const guide = buildGuide(
      asTags(['Gameplay Basics', 'Walkthroughs', 'Loot', 'Crafting', 'Achievements'])
    );

    expect(getGuideTopicTags(guide)).toEqual(['Gameplay Basics', 'Walkthroughs', 'Loot']);
    expect(getGuideTopicTags(guide)).toHaveLength(MAX_GUIDE_TAGS);
  });

  it('drops the languages steam files alongside the topics', () => {
    // A real multi-language guide: every topic but the first sits behind 26 languages.
    const guide = buildGuide(
      asTags([
        'Gameplay Basics',
        'Bulgarian',
        'Simplified Chinese',
        'English',
        'Portuguese (Brazil)',
        'Spanish-Latin America',
        'indonesian',
        'Walkthroughs',
      ])
    );

    expect(getGuideTopicTags(guide)).toEqual(['Gameplay Basics', 'Walkthroughs']);
  });

  it('honours a custom limit and survives a guide with no tags', () => {
    expect(getGuideTopicTags(buildGuide(asTags(['Loot', 'Crafting'])), 1)).toEqual(['Loot']);
    expect(getGuideTopicTags(buildGuide())).toEqual([]);
    expect(getGuideTopicTags(buildGuide([]))).toEqual([]);
  });
});

describe('getGuideUrl', () => {
  it('points at the steam page of the published file', () => {
    expect(getGuideUrl('638260986')).toBe(
      'https://steamcommunity.com/sharedfiles/filedetails/?id=638260986'
    );
  });
});
