import { HStack } from '@gamelog/common/gluestack/hstack';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';

export interface SocialTab {
  id: string;
  label: string;
  testID: string;
}

interface SocialTabSwitcherProps {
  tabs: SocialTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
}

export const SocialTabSwitcher: React.FC<SocialTabSwitcherProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
}) => (
  <HStack className="bg-background-200 p-1.5 rounded-lg">
    {tabs.map((tab) => {
      const isActive = tab.id === activeTabId;
      return (
        <Button
          key={tab.id}
          className={`flex-1 rounded-md ${isActive ? 'bg-primary-600' : 'bg-transparent'}`}
          onPress={() => onSelectTab(tab.id)}
          testID={tab.testID}
        >
          <ButtonText
            size="xs"
            className={`font-bold uppercase ${isActive ? 'text-white' : 'text-typography-400'}`}
          >
            {tab.label}
          </ButtonText>
        </Button>
      );
    })}
  </HStack>
);
