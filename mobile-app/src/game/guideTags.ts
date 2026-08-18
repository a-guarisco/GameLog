import type { PublishedFileDetails } from '@gamelog/api-manager/dto';

/**
 * Steam files a guide's supported languages in the same `tags` array as its topics, so a
 * multi-language guide can push every topic past the first slot. Lowercased for matching.
 */
const LANGUAGE_TAGS = new Set(
  [
    'Bulgarian',
    'Simplified Chinese',
    'Traditional Chinese',
    'Czech',
    'Danish',
    'Dutch',
    'English',
    'Finnish',
    'French',
    'German',
    'Greek',
    'Hungarian',
    'Indonesian',
    'Italian',
    'Japanese',
    'Korean',
    'Norwegian',
    'Polish',
    'Portuguese',
    'Portuguese (Brazil)',
    'Romanian',
    'Russian',
    'Spanish',
    'Spanish-Latin America',
    'Swedish',
    'Thai',
    'Turkish',
    'Ukrainian',
    'Vietnamese',
  ].map((language) => language.toLowerCase())
);

export const MAX_GUIDE_TAGS = 3;

export const getGuideTopicTags = (
  guide: PublishedFileDetails,
  limit: number = MAX_GUIDE_TAGS
): string[] =>
  (guide.tags ?? [])
    .map((tag) => tag.display_name)
    .filter((displayName) => !!displayName && !LANGUAGE_TAGS.has(displayName.toLowerCase()))
    .slice(0, limit);

/** Steam's public page for one published file. */
export const getGuideUrl = (publishedFileId: string) =>
  `https://steamcommunity.com/sharedfiles/filedetails/?id=${publishedFileId}`;
