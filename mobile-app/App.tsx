import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ScrollView } from 'react-native';
import { useState } from 'react';
import ApiManager from './src/api-manager/ApiManager';

const App = () => {
  const [result, setResult] = useState<string>('Press buttons to test API');
  const appId = 236390; // warThunder, I love tanks and big explosions
  const samSteamId = '76561198077919169';

  const handleApiCall = async (apiFunction: () => Promise<any>, loadingMessage: string) => {
    try {
      setResult(loadingMessage);
      const data = await apiFunction();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Fetch Steam News"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getGameNews(appId, 1, 300),
            'Loading news for game ' + appId
          )
        }
      />
      <Button
        title="Fetch Global Achievement"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getGlobalAchievement(appId),
            'Loading global achievement for game ' + appId
          )
        }
      />
      <Button
        title="Fetch Player Achievements Per App"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getAllPlayerAchievementsPerApp(appId, samSteamId),
            'Loading global achievement for player ' + samSteamId + ' for game ' + appId
          )
        }
      />
      <Button
        title="Fetch Completed Player Per App"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getCompletedPlayerAchievementsAndStatsPerApp(appId, samSteamId),
            'Loading completed player achievements and stats for player ' +
              samSteamId +
              ' for game ' +
              appId
          )
        }
      />
      <Button
        title="Fetch Players Info"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getPlayersInfo([samSteamId]),
            'Loading player info for player ' + samSteamId
          )
        }
      />
      <Button
        title="Fetch Players Per App"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getPlayerFriendsInfo(samSteamId, false),
            'Loading player friends info for player ' + samSteamId
          )
        }
      />
      <Button
        title="Fetch Players Owned Games"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getOwnedGames(samSteamId, true),
            'Loading owned games for player ' + samSteamId
          )
        }
      />
      <Button
        title="Fetch Players Recently Played Games"
        onPress={() =>
          handleApiCall(
            () => ApiManager.getRecentPlayedGames(samSteamId, 5),
            'Loading recently played games for player ' + samSteamId
          )
        }
      />

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
  },
});
