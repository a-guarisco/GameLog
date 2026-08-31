import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';
import { Spinner } from '@gamelog/common/gluestack/spinner';
import type { OwnedGames, PlaytimeByUser } from '@gamelog/api-manager/dto';

import ProfileOverviewTab from './tabs/ProfileOverviewTab';
import ProfileTimeTab from './tabs/ProfileTimeTab';
import ProfileGenresTab from './tabs/ProfileGenresTab';
import ProfilePlatformsTab from './tabs/ProfilePlatformsTab';

import type { PlaytimeTrend } from '@gamelog/common/charts/playtime-trend/selectPlaytimeTrend';
import type { PlatformSplit } from '@gamelog/common/charts/platform-split/selectPlatformSplit';

type ProfileSectionId = 'overview' | 'time' | 'genres' | 'platforms';

const TABS: SectionTab<ProfileSectionId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'time', label: 'Time' },
  { id: 'genres', label: 'Genres' },
  { id: 'platforms', label: 'Platforms' },
];

interface ProfileSectionTabsProps {
  playtimeTrend: PlaytimeTrend;
  errorPlaytimeTrend?: unknown;
  platformSplit: PlatformSplit;
  ownedGames?: OwnedGames | null;
  errorOwnedGames?: unknown;
  playtimeByUser?: PlaytimeByUser | null;
  errorPlaytimeByUser?: unknown;
  userId: string;
  isLoading?: boolean;
}

const ProfileSectionTabs = ({
  playtimeTrend,
  errorPlaytimeTrend,
  platformSplit,
  ownedGames,
  errorOwnedGames,
  playtimeByUser,
  errorPlaytimeByUser,
  userId,
  isLoading,
}: ProfileSectionTabsProps) => {
  const [activeTab, setActiveTab] = useState<ProfileSectionId>('overview');

  return (
    <Box>
      <SectionTabs
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
        testIDPrefix="profile-tab"
      />

      <VStack className="items-center pt-4" space="md" w="100%">
        {isLoading ? (
          <Spinner size="large" className="py-20 w-full" />
        ) : (
          <>
            {activeTab === 'overview' && <ProfileOverviewTab playtimeByUser={playtimeByUser} />}

            {activeTab === 'time' && (
              <ProfileTimeTab ownedGames={ownedGames} playtimeByUser={playtimeByUser} />
            )}

            {activeTab === 'genres' && <ProfileGenresTab ownedGames={ownedGames} />}

            {activeTab === 'platforms' && (
              <ProfilePlatformsTab platformSplit={platformSplit} hasError={!!errorOwnedGames} />
            )}
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ProfileSectionTabs;
