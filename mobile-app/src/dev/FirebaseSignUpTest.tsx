import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { useColorScheme } from 'nativewind';
import { createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@gamelog/auth/firebaseClient';
import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Button, ButtonText } from '@gamelog/common/gluestack/button';
import { ErrorBox, LoadingBox, SuccessBox, InfoBox, WarningBox } from '@gamelog/common/feedbacks';
import EndPoints from '@gamelog/api-manager/apiEndsPoints';

interface FirebaseSignUpTestProps {
  className?: string;
}

export const FirebaseSignUpTest = ({ className }: FirebaseSignUpTestProps) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [steamId, setSteamId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<any | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const clearMessages = () => {
    setStatusMessage(null);
    setWarningMessage(null);
    setErrorMessage(null);
  };

  const inputStyle = {
    color: isDarkMode ? '#FFFFFF' : '#111827',
    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
    borderColor: isDarkMode ? '#475569' : '#D1D5DB',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  };
  const placeholderColor = isDarkMode ? '#94A3B8' : '#6B7280';

  // Step 1: Firebase Auth Sign Up
  const handleSignUp = async () => {
    clearMessages();
    if (!email || !password) {
      setErrorMessage('Please enter an email and password');
      return;
    }
    setIsLoading(true);
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
    clearMessages();
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }
    setIsLoading(true);
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
    clearMessages();
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }
    setIsLoading(true);
    try {
      await auth.currentUser.reload();
      const verified = auth.currentUser.emailVerified;
      if (verified) {
        setStatusMessage('Reloaded Firebase user! Email Verified: YES (true)');
      } else {
        setWarningMessage('Reloaded Firebase user! Email Verified: NO (false)');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reload user status');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Register User in Backend
  const handleRegisterBackend = async () => {
    clearMessages();
    if (!auth.currentUser) {
      setErrorMessage('No Firebase user logged in');
      return;
    }

    setIsLoading(true);
    try {
      // Reload user to ensure currentUser.emailVerified is fresh
      await auth.currentUser.reload();

      if (!auth.currentUser.emailVerified) {
        setErrorMessage(
          'Email is not verified! Please confirm your email address (Step 2 & 3) before completing backend registration.'
        );
        return;
      }
      if (!username || !steamId) {
        setErrorMessage('Please enter a username and Steam ID for backend registration');
        return;
      }

      setBackendUser(null);
      // Force refresh token so the JWT contains updated email_verified: true claim
      const token = await auth.currentUser.getIdToken(true);
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
      <Text className="text-sm font-bold text-typography-0">
        Firebase Sign Up & Backend Sync Test
      </Text>

      {currentUser ? (
        <InfoBox
          message={`Active Firebase User:\nEmail: ${currentUser.email}\nUID: ${currentUser.uid}\nVerified: ${currentUser.emailVerified ? 'TRUE' : 'FALSE'}`}
        />
      ) : (
        <InfoBox message="No active Firebase user session" />
      )}

      <Box className="gap-2">
        <Text className="text-xs font-semibold text-typography-100">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="test@example.com"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          autoCapitalize="none"
        />

        <Text className="text-xs font-semibold text-typography-100">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={placeholderColor}
          secureTextEntry
          style={inputStyle}
        />

        <Text className="text-xs font-semibold text-typography-100">Username (Backend)</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="gamer_alias"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
          autoCapitalize="none"
        />

        <Text className="text-xs font-semibold text-typography-100">Steam ID (Backend)</Text>
        <TextInput
          value={steamId}
          onChangeText={setSteamId}
          placeholder="76561197960287930"
          placeholderTextColor={placeholderColor}
          style={inputStyle}
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

      {isLoading ? <LoadingBox message="Processing request..." /> : null}

      {statusMessage ? <SuccessBox message={statusMessage} /> : null}

      {warningMessage ? <WarningBox message={warningMessage} /> : null}

      {errorMessage ? <ErrorBox errorMessage={errorMessage} /> : null}

      {backendUser ? (
        <Box className="p-3 border-t border-outline-200/30 gap-1 mt-2">
          <Text className="text-xs font-bold text-typography-0">Backend User Record:</Text>
          <Text className="text-xs text-typography-100">ID: {backendUser.id}</Text>
          <Text className="text-xs text-typography-100">Username: {backendUser.username}</Text>
          <Text className="text-xs text-typography-100">Steam ID: {backendUser.steam_id}</Text>
        </Box>
      ) : null}
    </Box>
  );
};
