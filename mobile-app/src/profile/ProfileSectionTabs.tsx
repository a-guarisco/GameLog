import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/game/SectionTabs';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import OsShareChart from '@gamelog/common/charts/os-share/OsShareChart';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import ProfileTopGames from './ProfileTopGames';
import ProfileHoursPerGame from './ProfileHoursPerGame';
import ProfilePlaytimeTrend from './ProfilePlaytimeTrend';
import type { TopGame } from './profileSelectors';
import type { PlaytimeTrend } from './playtimeTrendSelectors';

type ProfileSectionId = 'overview' | 'time' | 'genres' | 'platforms';

const TABS: SectionTab<ProfileSectionId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'time', label: 'Time' },
  { id: 'genres', label: 'Genres' },
  { id: 'platforms', label: 'Platforms' },
];

interface ProfileSectionTabsProps {
  topGames: TopGame[];
  /** Day-by-day playtime for the time panel, already shaped by the page. */
  playtimeTrend: PlaytimeTrend;
  errorPlaytimeTrend?: unknown;
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
  playtimeTrend,
  errorPlaytimeTrend,
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

        {/* When the library played is the question, the answer is two shapes: when, and on what. */}
        {activeTab === 'time' && (
          <VStack space="md" className="w-full items-center">
            <Box className="w-full">
              <ProfilePlaytimeTrend trend={playtimeTrend} hasError={!!errorPlaytimeTrend} />
            </Box>
            <Box className="w-full">
              <ProfileHoursPerGame games={topGames} hasError={!!errorOwnedGames} />
            </Box>
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
