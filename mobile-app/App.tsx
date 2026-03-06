import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ScrollView } from 'react-native';
import { useState } from 'react';
import ApiManager from './src/ApiManager/ApiManager';

const App = () => {
  const [result, setResult] = useState<string>('Press buttons to test API');

  const getNews = async () => {
    try {
      setResult('Loading news...');
      // Testing with AppId 236390 (War Thunder)
      const news = await ApiManager.getGameNews(236390, 1, 300);
      setResult(JSON.stringify(news, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const getGlobalAchievement = async () => {
    try {
      setResult('Loading Global Achievement...');
      const globalAchievement = await ApiManager.getGlobalAchievement(236390);
      setResult(JSON.stringify(globalAchievement, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const getPlayerAchievements = async () => {
    try {
      setResult('Loading Player Achievements...');
      // Testing with Sam account (steamId: 76561198077919169)
      const playerAchievements = await ApiManager.getPlayerAchievements(236390, '76561198077919169');
      setResult(JSON.stringify(playerAchievements, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
      <View style={styles.container}>

        <Button title="Fetch Steam News" onPress={getNews} />
        <Button title="Fetch Global Achievement" onPress={getGlobalAchievement} />
        <Button title="Fetch Player Achievements" onPress={getPlayerAchievements} />

        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>

        <StatusBar style="auto" />
      </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    marginTop: 20,
    width: '90%',
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    fontFamily: 'monospace',
  }
});
