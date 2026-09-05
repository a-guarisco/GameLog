import {
  lightconfig,
  darkconfig,
  commonColors,
  rawConfig,
} from '@gamelog/common/gluestack/gluestack-ui-provider/config';
import { View, ScrollView } from 'react-native';
import { Text } from '@gamelog/common/gluestack/text';
import { useColorScheme } from 'nativewind';
import { DevScreenWrapper } from './DevScreenWrapper';

export const PaletteView = () => {
  const { colorScheme } = useColorScheme();
  if (!colorScheme) {
    return (
      <DevScreenWrapper className="items-center justify-center">
        <Text className="text-base">Unable to determine color scheme</Text>
      </DevScreenWrapper>
    );
  }
  return (
    <DevScreenWrapper>
      <ScrollView className="flex-1 p-4">
        <Text className="my-4 text-lg font-bold">Light Theme</Text>
        {Object.entries(lightconfig).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: `rgb(${value})`, width: 80, height: 40, borderRadius: 8 }}
            />
            <Text className="ml-3 text-base ">
              {key} ({value})
            </Text>
          </View>
        ))}

        <Text className="my-4 text-lg font-bold">Dark Theme</Text>
        {Object.entries(darkconfig).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: `rgb(${value})`, width: 80, height: 40, borderRadius: 8 }}
            />
            <Text className="ml-3 text-base">
              {key} ({value})
            </Text>
          </View>
        ))}

        <Text className="my-4 text-lg font-bold">Common Colors</Text>
        {Object.entries(commonColors).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: `rgb(${value})`, width: 80, height: 40, borderRadius: 8 }}
            />
            <Text className="ml-3 text-base">
              {key} ({value})
            </Text>
          </View>
        ))}

        <Text className="my-4 text-lg font-bold">Active Theme</Text>
        {Object.entries(rawConfig[colorScheme]).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: `rgb(${value})`, width: 80, height: 40, borderRadius: 8 }}
            />
            <Text className="ml-3 text-base">
              {key} ({value})
            </Text>
          </View>
        ))}
      </ScrollView>
    </DevScreenWrapper>
  );
};
