import { useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import { VStack } from '@gamelog/common/gluestack/vstack';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';
import TotalHoursPieChart from '@gamelog/common/charts/total-hours/TotalHoursPieChart';
import GameGenreRadarChart from '@gamelog/common/charts/genre-radar/GameGenreRadarChart';
import type { OwnedGames } from '@gamelog/api-manager/dto';
import ProfileTopGames from './ProfileTopGames';
import TotalHoursChart from '@gamelog/common/charts/total-hours/TotalHoursChart';
import ProfilePlaytimeTrend from './ProfilePlaytimeTrend';
import ProfilePlatformSplit from './ProfilePlatformSplit';
import type { TopGame } from './profileSelectors';
import type { PlaytimeTrend } from './playtimeTrendSelectors';
import type { PlatformSplit } from './platformSplitSelectors';

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
  /** Lifetime hours per platform for the platforms panel, already shaped by the page. */
  platformSplit: PlatformSplit;
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
  platformSplit,
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
        {/* Recent activity first: the landing panel should answer "what have I been up to". */}
        {activeTab === 'overview' && (
          <VStack space="md" className="w-full">
            <ProfilePlaytimeTrend trend={playtimeTrend} hasError={!!errorPlaytimeTrend} />
            <ProfileTopGames games={topGames} hasError={!!errorOwnedGames} />
          </VStack>
        )}

        {activeTab === 'time' && (
          <VStack space="md" className="w-full items-center">
            <Box className="w-full">
              <TotalHoursChart
                ownedGames={ownedGames}
                isLoadingOwnedGames={false}
                errorOwnedGames={errorOwnedGames}
              />
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
          <Box className="w-full">
            <ProfilePlatformSplit split={platformSplit} hasError={!!errorOwnedGames} />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ProfileSectionTabs;
