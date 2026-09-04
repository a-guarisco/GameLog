// Developer Dashboard Main Navigation View (Minimal, Generous Padding, Minimal Gap)
import { Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { HStack } from '@gamelog/common/gluestack/hstack';

interface DevMenuSection {
  id: string;
  title: string;
  route: string;
}

const SECTIONS: DevMenuSection[] = [
  {
    id: 'env',
    title: 'Environment Variables',
    route: 'DevEnv',
  },
  {
    id: 'aesthetics',
    title: 'Aesthetics & Theme',
    route: 'DevAesthetics',
  },
  {
    id: 'backend',
    title: 'Backend & Endpoints',
    route: 'DevBackend',
  },
  {
    id: 'auth',
    title: 'Authentication',
    route: 'DevAuth',
  },
];

export const DevView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-start gap-3 px-4 py-4">
        {/* Header */}
        <Box className="mb-1">
          <Text className="text-2xl font-bold text-typography-0">Developer Dashboard</Text>
        </Box>

        {/* Generous Padding Cards with Tiny Gap Between Cards */}
        <Box className="gap-1 w-full max-w-[640px] self-center">
          {SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              testID={`dev-menu-item-${section.id}`}
              onPress={() => navigation.navigate(section.route)}
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1.0,
                transform: [{ scale: pressed ? 0.98 : 1.0 }],
              })}
            >
              <Card variant="elevated" className="w-full py-5 px-5  rounded-md">
                <HStack className="items-center justify-between">
                  <Text className="text-base font-semibold text-typography-0">{section.title}</Text>
                  <Ionicons name="chevron-forward-outline" size={20} color="#94A3B8" />
                </HStack>
              </Card>
            </Pressable>
          ))}
        </Box>
      </Box>
    </ScrollView>
  );
};
