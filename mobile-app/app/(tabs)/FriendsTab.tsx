import '@tamagui/native/setup-zeego';
import { Text, View } from 'tamagui';

const FriendsTab = () => {
  return (
    <View flex={1} items="center" justify="center" bg="$background">
      <Text fontSize={20} color="$blue10">
        Friends
      </Text>
    </View>
  );
};

export default FriendsTab;
