import { View } from 'react-native';
import { Text } from '@gamelog/common/gluestack/text';
import { Spinner } from '@gamelog/common/gluestack/spinner';

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-50 dark:bg-background-0">
      <Text size="3xl" bold className="mb-4">
        GameLog
      </Text>
      <Spinner size="large" />
    </View>
  );
}
