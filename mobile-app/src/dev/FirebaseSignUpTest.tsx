import { useState } from 'react';
import { TextInput } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { ErrorBox, LoadingBox, SuccessBox, InfoBox } from '@gamelog/common/feedbacks';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

interface FirebaseSignUpTestProps {
  className?: string;
}

export const FirebaseSignUpTest = ({ className }: FirebaseSignUpTestProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [steamId, setSteamId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<any | null>(null);

  const currentUser = auth.currentUser;

  // Step 1: Firebase Auth Sign Up
  const handleSignUp = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter an email and password');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      setStatusMessage(`Firebase user created! UID: ${cred.user.uid}`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign Up failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send Email Verification
  const handleSendVerification = async () => {
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setStatusMessage(
        `Verification email sent to ${auth.currentUser.email}! (Check emulator console or inbox)`
      );
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Check / Reload Verification Status
  const handleCheckStatus = async () => {
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      setStatusMessage(
        `Reloaded Firebase user! Email Verified: ${verified ? 'YES (true)' : 'NO (false)'}`
      );
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reload user status');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Register User in Backend
  const handleRegisterBackend = async () => {
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }
    if (!username || !steamId) {
      setErrorMessage('Please enter a username and Steam ID for backend registration');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setBackendUser(null);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(EndPoints.registerUser(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          steam_id: steamId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setStatusMessage('User registered in Backend DB successfully!');
        setBackendUser(data);
      } else {
        throw new Error(data.detail || `Backend error (status ${response.status})`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Backend registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={`w-full max-w-[320px] gap-3 self-center ${className ?? ''}`}>
      <Text className="text-sm font-bold text-typography-900">
        🔑 Firebase Sign Up & Backend Sync Test
      </Text>

      <Box className="gap-2">
        <Text className="text-xs text-typography-500">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="test@example.com"
          placeholderTextColor="#999"
          className="rounded border border-outline-300 bg-background-50 px-3 py-2 text-sm text-typography-900"
          autoCapitalize="none"
        />

        <Text className="text-xs text-typography-500">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#999"
          secureTextEntry
          className="rounded border border-outline-300 bg-background-50 px-3 py-2 text-sm text-typography-900"
        />

        <Text className="text-xs text-typography-500">Username (Backend)</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="gamer_alias"
          placeholderTextColor="#999"
          className="rounded border border-outline-300 bg-background-50 px-3 py-2 text-sm text-typography-900"
          autoCapitalize="none"
        />

        <Text className="text-xs text-typography-500">Steam ID (Backend)</Text>
        <TextInput
          value={steamId}
          onChangeText={setSteamId}
          placeholder="76561197960287930"
          placeholderTextColor="#999"
          className="rounded border border-outline-300 bg-background-50 px-3 py-2 text-sm text-typography-900"
          autoCapitalize="none"
        />
      </Box>

      <Box className="gap-2 pt-1">
        <Button onPress={handleSignUp} isDisabled={isLoading}>
          <ButtonText>1. Sign Up (Firebase Auth)</ButtonText>
        </Button>

        <Button onPress={handleSendVerification} isDisabled={isLoading || !currentUser}>
          <ButtonText>2. Send Verification Email</ButtonText>
        </Button>

        <Button onPress={handleCheckStatus} isDisabled={isLoading || !currentUser}>
          <ButtonText>3. Reload & Check Verification</ButtonText>
        </Button>

        <Button onPress={handleRegisterBackend} isDisabled={isLoading || !currentUser}>
          <ButtonText>4. Complete Backend Sync</ButtonText>
        </Button>
      </Box>

      {currentUser ? (
        <InfoBox
          message={`Active Firebase User:\nUID: ${currentUser.uid}\nEmail: ${currentUser.email}\nVerified: ${currentUser.emailVerified ? 'TRUE' : 'FALSE'}`}
        />
      ) : null}

      {isLoading ? <LoadingBox message="Processing request..." /> : null}

      {statusMessage ? <SuccessBox message={statusMessage} /> : null}

      {errorMessage ? <ErrorBox errorMessage={errorMessage} /> : null}

      {backendUser ? (
        <Box className="rounded bg-background-100 p-2 border border-outline-200">
          <Text className="text-xs font-bold text-typography-900">Backend User Record:</Text>
          <Text className="text-xs text-typography-700">ID: {backendUser.id}</Text>
          <Text className="text-xs text-typography-700">Username: {backendUser.username}</Text>
          <Text className="text-xs text-typography-700">Steam ID: {backendUser.steam_id}</Text>
        </Box>
      ) : null}
    </Box>
  );
};
