import { PublishedFileDetails } from './dto';

export const filterValidScreenshots = (details?: PublishedFileDetails[]): PublishedFileDetails[] => {
  if (!details) return [];
  return details.filter((file) => !!file.image_url);
};

export const mergeUniqueScreenshots = (
  existing: PublishedFileDetails[],
  incoming: PublishedFileDetails[]
): PublishedFileDetails[] => {
  const seen = new Set(existing.map((file) => file.publishedfileid));
  const newItems = incoming.filter((file) => !seen.has(file.publishedfileid));
  return [...existing, ...newItems];
};
