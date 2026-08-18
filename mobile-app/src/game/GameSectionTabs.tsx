import { ReactNode, useState } from 'react';
import { Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';
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
      <HStack className="border-b border-outline-100">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              testID={`game-tab-${tab.id}`}
              className="flex-1 h-11 items-center justify-center"
            >
              <Text
                size="sm"
                className={
                  isActive ? 'font-bold text-primary-300' : 'font-medium text-typography-300'
                }
              >
                {tab.label}
              </Text>
              {isActive && (
                <Box className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />
              )}
            </Pressable>
          );
        })}
      </HStack>

      {activeTab === 'achievements' && <Box className="pt-4">{achievementsSlot}</Box>}
      {activeTab === 'news' && <GameNewsPanel appid={appid} />}
      {activeTab === 'guides' && <GameGuidesPanel appid={appid} />}
    </Box>
  );
};

export default GameSectionTabs;
