import { ReactNode, useState } from 'react';
import { Box } from '@gamelog/common/gluestack/box';
import SectionTabs from '@gamelog/common/SectionTabs';
import GameNewsPanel from '@gamelog/game/GameNewsPanel';
import GameGuidesPanel from '@gamelog/game/GameGuidesPanel';

type SectionId = 'achievements' | 'news' | 'guides';

const TABS: { id: SectionId; label: string }[] = [
  { id: 'achievements', label: 'Achievements' },
  { id: 'news', label: 'News' },
  { id: 'guides', label: 'Guides' },
];

interface GameSectionTabsProps {
  appid: string;
  achievementsSlot: ReactNode;
}

const GameSectionTabs = ({ appid, achievementsSlot }: GameSectionTabsProps) => {
  const [activeTab, setActiveTab] = useState<SectionId>('achievements');

  return (
    <Box>
      <SectionTabs
        tabs={TABS}
        activeId={activeTab}
        onChange={setActiveTab}
        testIDPrefix="game-tab"
      />

      {activeTab === 'achievements' && <Box className="pt-4">{achievementsSlot}</Box>}
      {activeTab === 'news' && <GameNewsPanel appid={appid} />}
      {activeTab === 'guides' && <GameGuidesPanel appid={appid} />}
    </Box>
  );
};

export default GameSectionTabs;
