import { useState, useRef, useEffect } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Box } from '@gamelog/common/gluestack/box';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import CommunityGenreRadarChart from '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart';
import { useOrientation } from '@gamelog/common/useOrientation';
import type { OwnedGames } from '@gamelog/api-manager/dto';

interface ProfileGenresTabProps {
  ownedGames?: OwnedGames | null;
}

const ProfileGenresTab = ({ ownedGames }: ProfileGenresTabProps) => {
  const { isLandscape, height } = useOrientation();
  const [isCommunityExpanded, setIsCommunityExpanded] = useState(false);
  const isExpandedRef = useRef(false);
  const hasMeasuredRef = useRef(false);

  const initialClosedHeight = isLandscape ? Math.round(height * 0.55) + 110 : undefined;
  const [closedHeight, setClosedHeight] = useState<number | undefined>(initialClosedHeight);

  useEffect(() => {
    hasMeasuredRef.current = false;
    setClosedHeight(initialClosedHeight);
  }, [isLandscape, height]);

  if (!isLandscape) {
    return (
      <VStack space="md" className="w-full">
        <GameGenreRadarChart ownedGames={ownedGames} />
        <CommunityGenreRadarChart ownedGames={ownedGames} />
      </VStack>
    );
  }

  const effectiveHeight = closedHeight ?? initialClosedHeight;

  const handleExpandedChange = (expanded: boolean) => {
    isExpandedRef.current = expanded;
    setIsCommunityExpanded(expanded);
  };

  return (
    <HStack
      space="md"
      className="w-full items-start"
      style={{ alignItems: 'flex-start' }}
    >
      <Box
        className="flex-1 items-start"
        style={
          effectiveHeight
            ? { alignSelf: 'flex-start', maxHeight: effectiveHeight }
            : { alignSelf: 'flex-start' }
        }
      >
        <GameGenreRadarChart
          ownedGames={ownedGames}
          targetHeight={effectiveHeight}
        />
      </Box>
      <Box
        className="flex-1"
        style={{ alignSelf: 'flex-start' }}
        onLayout={(e) => {
          if (hasMeasuredRef.current || isExpandedRef.current || isCommunityExpanded) {
            return;
          }
          const h = e.nativeEvent.layout.height;
          // Discard measurements that represent loading spinners (<65%) or expanded cards (>125%)
          const minValidHeight = (initialClosedHeight ?? 200) * 0.65;
          const maxValidClosedHeight = (initialClosedHeight ?? 400) * 1.25;
          if (h >= minValidHeight && h <= maxValidClosedHeight) {
            hasMeasuredRef.current = true;
            if (h !== closedHeight) {
              setClosedHeight(h);
            }
          }
        }}
      >
        <CommunityGenreRadarChart
          ownedGames={ownedGames}
          onExpandedChange={handleExpandedChange}
          style={effectiveHeight ? { minHeight: effectiveHeight } : undefined}
        />
      </Box>
    </HStack>
  );
};

export default ProfileGenresTab;


