import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '@gamelog/auth/firebaseClient';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { SuccessBox, InfoBox } from '@gamelog/common/feedbacks';

import { FirebaseTokenGenerator } from './FirebaseTokenGenerator';
import { BackendTestAuth } from './BackendTestAuth';
import { FirebaseSignUpTest } from './FirebaseSignUpTest';
import { GoogleAuthTest } from './GoogleAuthTest';
import { FirebaseDeviceNotificationTest } from './FirebaseDeviceNotificationTest';

export const DevAuthView = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOutAndClearStorage = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.clear();
      setCurrentUser(null);
      setSessionMessage('Successfully signed out and cleared AsyncStorage auth tokens!');
    } catch (err: unknown) {
      setSessionMessage(err instanceof Error ? err.message : 'Error clearing session');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-start gap-2.5 px-4 py-4">
        <Box className="mb-1">
          <Text className="text-xl font-bold text-typography-0">Authentication</Text>
        </Box>

        {/* Active Session & Clear Storage Card (Top) */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Active Session & Storage</Text>

          <InfoBox
            message={
              currentUser
                ? `Active Firebase User:\nEmail: ${currentUser.email}\nUID: ${currentUser.uid}\nVerified: ${currentUser.emailVerified ? 'TRUE' : 'FALSE'}`
                : 'No active session (Logged Out)'
            }
          />

          <Button onPress={handleSignOutAndClearStorage} className="w-full mt-1">
            <ButtonText>Sign Out & Clear AsyncStorage</ButtonText>
          </Button>

          {sessionMessage ? <SuccessBox message={sessionMessage} /> : null}
        </Card>

        {/* FCM Push Notification Device Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">
            FCM Device Push Registration
          </Text>
          <FirebaseDeviceNotificationTest className="w-full" />
        </Card>

        {/* Token Generator Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Firebase Token Generator</Text>
          <FirebaseTokenGenerator className="w-full" />
        </Card>

        {/* Backend Auth Tester Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Backend Auth Verification</Text>
          <BackendTestAuth className="w-full" />
        </Card>

        {/* Google OAuth2 Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">Google OAuth2 Sign-In</Text>
          <GoogleAuthTest className="w-full" />
        </Card>

        {/* User Registration Pipeline Card */}
        <Card
          variant="elevated"
          className="w-full max-w-[640px] self-center p-3.5 gap-2 bg-background-50 rounded-md"
        >
          <Text className="text-sm font-semibold text-typography-0">
            User Sign Up & Email Verification
          </Text>
          <FirebaseSignUpTest className="w-full" />
        </Card>
      </Box>
    </ScrollView>
  );
};
