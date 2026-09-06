import { View, Image } from 'react-native';
import { Spinner } from '@gamelog/common/gluestack/spinner';

const splashIcon = require('../../../images/logo/splashIcon.png');

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-50 dark:bg-background-0">
      <Image
        source={splashIcon}
        resizeMode="contain"
        className="w-52 h-52 mb-6"
        style={{ backgroundColor: 'transparent' }}
        accessibilityLabel="GameLog"
        testID="splash-logo"
      />
      <Spinner size="large" />
    </View>
  );
}

