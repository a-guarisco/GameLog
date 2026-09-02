import { ReactNode, useState } from 'react';
import { ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import SectionTabs from '@gamelog/common/SectionTabs';
import GameNewsPanel from '@gamelog/game/GameNewsPanel';
import GameGuidesPanel from '@gamelog/game/GameGuidesPanel';

export type GameSectionId = 'achievements' | 'news' | 'guides' | 'screenshots';

const BASE_TABS: { id: GameSectionId; label: string }[] = [
  { id: 'achievements', label: 'Achievements' },
  { id: 'news', label: 'News' },
  { id: 'guides', label: 'Guides' },
];

interface GameSectionTabsProps {
  appid: string;
  achievementsSlot: ReactNode;
  screenshotsSlot?: ReactNode;
  activeTab?: GameSectionId;
  onTabChange?: (tab: GameSectionId) => void;
  stickyHeader?: boolean;
}

const GameSectionTabs = ({
  appid,
  achievementsSlot,
  screenshotsSlot,
  activeTab: controlledActiveTab,
  onTabChange,
  stickyHeader = false,
}: GameSectionTabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState<GameSectionId>('achievements');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: GameSectionId) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs: { id: GameSectionId; label: string }[] = screenshotsSlot
    ? [...BASE_TABS, { id: 'screenshots', label: 'Screenshots' }]
    : BASE_TABS;

  const tabSelector = (
    <SectionTabs
      tabs={tabs}
      activeId={activeTab}
      onChange={handleTabChange}
      testIDPrefix="game-tab"
    />
  );

  const panelContent = (
    <>
      {activeTab === 'achievements' && <Box className="pt-4">{achievementsSlot}</Box>}
      {activeTab === 'news' && <GameNewsPanel appid={appid} />}
      {activeTab === 'guides' && <GameGuidesPanel appid={appid} />}
      {activeTab === 'screenshots' && screenshotsSlot && (
        <Box className="pt-4">{screenshotsSlot}</Box>
      )}
    </>
  );

  if (stickyHeader) {
    return (
      <Box className="flex-1">
        <Box className="pb-2 bg-background-0 z-10">{tabSelector}</Box>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={true}
        >
          {panelContent}
        </ScrollView>
      </Box>
    );
  }

  return (
    <Box>
      {tabSelector}
      {panelContent}
    </Box>
  );
};

export default GameSectionTabs;
