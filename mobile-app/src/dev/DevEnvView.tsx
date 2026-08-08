import { ScrollView } from 'react-native';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { ExpoEnvInfo } from './ExpoEnvInfo';

export const DevEnvView = () => {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-start gap-2.5 px-4 py-4">
        <Box className="mb-1">
          <Text className="text-xl font-bold text-typography-0">Environment Variables</Text>
        </Box>

        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2.5 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">
            Runtime Config & Variables
          </Text>
          <ExpoEnvInfo />
        </Card>
      </Box>
    </ScrollView>
  );
};
