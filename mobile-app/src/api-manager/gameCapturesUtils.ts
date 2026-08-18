import { PublishedFileDetails } from './dto';

export const filterValidCaptures = (details?: PublishedFileDetails[]): PublishedFileDetails[] => {
  if (!details) return [];
  return details.filter((file) => !!file.image_url);
};

export const mergeUniqueCaptures = (
  existing: PublishedFileDetails[],
  incoming: PublishedFileDetails[]
): PublishedFileDetails[] => {
  const seen = new Set(existing.map((file) => file.publishedfileid));
  const newItems = incoming.filter((file) => !seen.has(file.publishedfileid));
  return [...existing, ...newItems];
};
