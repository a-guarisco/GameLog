import { useState } from 'react';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';
import CommunityPlaytimeHistogramChart from '@gamelog/common/charts/community-playtime-histogram/CommunityPlaytimeHistogramChart';
import CommunityTopGamesHistogramChart from '@gamelog/common/charts/community-top-games-histogram/CommunityTopGamesHistogramChart';
import type { CommunityScope, OwnedGames } from '@gamelog/api-manager/dto';

const COMMUNITY_SCOPES: SectionTab<CommunityScope>[] = [
  { id: 'global', label: 'Global' },
  { id: 'region', label: 'Region' },
  { id: 'friends', label: 'Friends' },
];

interface ProfileCommunityTabProps {
  ownedGames?: OwnedGames | null;
}

const ProfileCommunityTab = ({ ownedGames }: ProfileCommunityTabProps) => {
  const [scope, setScope] = useState<CommunityScope>('global');

  return (
    <VStack space="md" className="w-full" testID="profile-community-tab">
      <SectionTabs<CommunityScope>
        tabs={COMMUNITY_SCOPES}
        activeId={scope}
        onChange={setScope}
        testIDPrefix="community-scope-tab"
      />
      <CommunityPlaytimeHistogramChart scope={scope} />
      <CommunityTopGamesHistogramChart scope={scope} ownedGames={ownedGames} />
    </VStack>
  );
};

export default ProfileCommunityTab;

