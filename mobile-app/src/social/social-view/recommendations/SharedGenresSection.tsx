import React from 'react';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';
import Chip from '@gamelog/common/Chip';
import { GenreResult } from '@gamelog/api-manager/dto';

interface SharedGenresSectionProps {
  genres: GenreResult[];
}

export const SharedGenresSection: React.FC<SharedGenresSectionProps> = ({ genres }) => {
  if (!genres || genres.length === 0) return null;

  return (
    <SectionCard label="Shared Genres">
      <HStack className="flex-wrap gap-2 pt-1">
        {genres.map((genre, idx) => (
          <Chip key={idx} className="bg-primary-500/15 border border-primary-500/30">
            <Text size="xs" className="font-bold uppercase text-primary-700">
              {genre.description || genre.id}
            </Text>
          </Chip>
        ))}
      </HStack>
    </SectionCard>
  );
};
