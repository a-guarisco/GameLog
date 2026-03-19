import { rawConfig } from '@gamelog/components/ui/gluestack-ui-provider/config';
import { View, ScrollView } from 'react-native';
import { Text } from '@gamelog/components/ui/text';

export const DevPaletteView = () => (
  <ScrollView className="flex-1  p-4">
    {Object.entries(rawConfig.light).map(([key, value]) => (
      <View key={key} className="flex-row items-center mb-2">
        <View
          style={{ backgroundColor: `rgb(${value})`, width: 80, height: 40, borderRadius: 8 }}
        />
        <Text className="ml-3 text-base color-white">
          {key} ({value})
        </Text>
      </View>
    ))}
  </ScrollView>
);
