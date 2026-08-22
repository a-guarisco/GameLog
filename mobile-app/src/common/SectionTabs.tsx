import { Pressable } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';
import { Text } from '@gamelog/common/gluestack/text';

export interface SectionTab<Id extends string> {
  id: Id;
  label: string;
}

interface SectionTabsProps<Id extends string> {
  tabs: SectionTab<Id>[];
  activeId: Id;
  onChange: (id: Id) => void;
  testIDPrefix: string;
}

const SectionTabs = <Id extends string>({
  tabs,
  activeId,
  onChange,
  testIDPrefix,
}: SectionTabsProps<Id>) => (
  <Card variant="elevated" className="p-0 overflow-hidden">
    <HStack className="w-full">
    {tabs.map((tab) => {
      const isActive = tab.id === activeId;
      return (
        <Pressable
          key={tab.id}
          onPress={() => onChange(tab.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isActive }}
          accessibilityLabel={tab.label}
          testID={`${testIDPrefix}-${tab.id}`}
          className="h-11 flex-1 items-center justify-center"
        >
          <Text
            size="sm"
            className={isActive ? 'font-bold text-primary-300' : 'font-medium text-typography-300'}
          >
            {tab.label}
          </Text>
          {isActive && <Box className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400" />}
        </Pressable>
      );
    })}
    </HStack>
  </Card>
);

export default SectionTabs;
