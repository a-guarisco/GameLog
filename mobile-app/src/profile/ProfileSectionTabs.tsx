import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/game/SectionTabs';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import ProfileTopGames from './ProfileTopGames';
import type { TopGame } from './profileSelectors';

type ProfileSectionId = 'overview' | 'time' | 'genres' | 'platforms';

const TABS: SectionTab<ProfileSectionId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'time', label: 'Time' },
  { id: 'genres', label: 'Genres' },
  { id: 'platforms', label: 'Platforms' },
];

interface ProfileSectionTabsProps {
  topGames: TopGame[];
  ownedGames?: OwnedGames | null;
  errorOwnedGames?: unknown;
  genreChartData?: any[];
  errorGenreChart?: unknown;
}

/**
 * Four views onto the same library. The page gates on its own loading state, so every chart
 * is handed `isLoading={false}` and only has to render or fail.
 */
const ProfileSectionTabs = ({
  topGames,
  ownedGames,
  errorOwnedGames,
  genreChartData,
  errorGenreChart,
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

      <VStack className="items-center pt-4">
        {activeTab === 'overview' && (
          <Box className="w-full">
            <ProfileTopGames games={topGames} hasError={!!errorOwnedGames} />
          </Box>
        )}

        {activeTab === 'time' && (
          <VStack space="md" className="w-full items-center">
            <TotalHoursChart
              ownedGames={ownedGames}
              isLoadingOwnedGames={false}
              errorOwnedGames={errorOwnedGames}
            />
            <TotalHoursPieChart
              ownedGames={ownedGames}
              isLoadingOwnedGames={false}
              errorOwnedGames={errorOwnedGames}
            />
          </VStack>
        )}

        {activeTab === 'genres' && (
          <GameGenreRadarChart
            genreChartData={genreChartData}
            isLoadingGenreChart={false}
            errorGenreChart={errorGenreChart}
          />
        )}

        {activeTab === 'platforms' && (
          <OsShareChart
            ownedGames={ownedGames}
            isLoadingOwnedGames={false}
            errorOwnedGames={errorOwnedGames}
          />
        )}
      </VStack>
    </Box>
  );
};

export default ProfileSectionTabs;
