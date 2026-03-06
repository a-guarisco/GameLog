import '@tamagui/native/setup-zeego';
import { Link, Tabs } from 'expo-router';
import { Button, useTheme } from 'tamagui';
import { Atom, AudioWaveform } from '@tamagui/lucide-icons';

// import { LogBox } from 'react-native';

// // Silenzia i warning specifici che sappiamo essere "falsi positivi" nel nostro setup
// LogBox.ignoreLogs([
//   "Must call import \Status@tamagui/native/setup-zeego'",
//   'Layout children must be of type Screen',
// ]);

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,
      }}
    >
      <Tabs.Screen
        name="HomeTab"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Atom color={color as any} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Button mr="$4" size="$2.5">
                Hello!
              </Button>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="GameListTab"
        options={{
          title: 'Game List',
          tabBarIcon: ({ color }) => <AudioWaveform color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="FriendsTab"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <AudioWaveform color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="ProfileTab"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <AudioWaveform color={color as any} />,
        }}
      />
    </Tabs>
  );
}
