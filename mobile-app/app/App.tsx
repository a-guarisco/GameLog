import { View, Text } from 'react-native';
import useAppInit from '../hooks/useAppInit';
import { SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const { isReady } = useAppInit();
  if (!isReady) {
    return null;
  }
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Welcome to GameLog!</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

export default App;
