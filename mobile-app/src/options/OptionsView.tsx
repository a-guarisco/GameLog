import { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { useColorScheme } from 'nativewind';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { signOutGoogle } from '@gamelog/auth/googleAuth';
import { clearAllSecureStorage } from '@gamelog/storage/secureStorage';
import { clearSteamApiKey, setSteamApiKey } from '@gamelog/api-manager/steamApiKey';
import {
  getStoredRegistration,
  requestAndRegisterPushToken,
  unregisterPushToken,
  clearStoredRegistration,
} from '@gamelog/notifications';
import apiManager from '@gamelog/api-manager/apiManager';

import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { Button, ButtonText } from '@gamelog/common/button';
import { GLTextInput } from '@gamelog/common/GLTextInput';

import { ActionConfirmModal } from '@gamelog/common/ActionConfirmModal';
import ScrollablePage from '@gamelog/common/ScrollablePage';
import { PageTitle } from '@gamelog/common/typography/CommonTypography';
import Ionicons from '@react-native-vector-icons/ionicons';
import { brand } from '@gamelog/theme/theme';
import { toHex } from '@gamelog/theme/themeHelpers';
import { useOrientation } from '@gamelog/common/useOrientation';

export const OptionsView = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { isLandscape, width } = useOrientation();
  const isCenteredLayout = isLandscape || width > 640;
  const textColor = isDarkMode
    ? toHex(brand.typographyDark['0'])
    : toHex(brand.typographyLight['0']);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Steam API Key update
  const [newSteamApiKey, setNewSteamApiKey] = useState('');
  const [updatingApiKey, setUpdatingApiKey] = useState(false);
  const [apiKeyFeedback, setApiKeyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkNotificationStatus = async () => {
      try {
        const user = getFirebaseAuth().currentUser;
        const stored = await getStoredRegistration();
        const { status } = await Notifications.getPermissionsAsync();
        if (isMounted) {
          setNotificationsEnabled(
            status === 'granted' && stored.token !== null && (!user || stored.userId === user.uid)
          );
        }
      } catch (err) {
        console.warn('[OptionsView] Error checking notification status:', err);
      }
    };
    checkNotificationStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newTheme);
  };

  const handleToggleNotifications = async () => {
    setLoadingNotifications(true);
    try {
      if (notificationsEnabled) {
        await unregisterPushToken();
        setNotificationsEnabled(false);
      } else {
        const { status: currentStatus } = await Notifications.getPermissionsAsync();
        if (currentStatus === 'denied') {
          await Linking.openSettings();
        } else {
          const res = await requestAndRegisterPushToken();
          if (res.success) {
            setNotificationsEnabled(true);
          } else {
            const { status: finalStatus } = await Notifications.getPermissionsAsync();
            if (finalStatus === 'denied') {
              await Linking.openSettings();
            }
          }
        }
      }
    } catch (error) {
      console.warn('[OptionsView] Error toggling notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleUpdateSteamApiKey = async () => {
    const trimmed = newSteamApiKey.trim();
    if (!trimmed) return;
    setUpdatingApiKey(true);
    setApiKeyFeedback(null);
    try {
      await apiManager.updateSteamApiKey(trimmed);
      setSteamApiKey(trimmed);
      setNewSteamApiKey('');
      setApiKeyFeedback({ type: 'success', message: 'Steam API Key updated successfully.' });
    } catch (error: any) {
      const detail: string = error?.response?.data?.detail ?? error?.message ?? 'Unknown error';
      const isInvalid = detail.toLowerCase().includes('invalid');
      setApiKeyFeedback({
        type: 'error',
        message: isInvalid ? 'Invalid Steam API Key or Steam ID.' : 'Failed to update. Please try again.',
      });
    } finally {
      setUpdatingApiKey(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(getFirebaseAuth());
      await signOutGoogle();
      await AsyncStorage.clear();
      await clearAllSecureStorage();
      await clearSteamApiKey();
      await clearStoredRegistration();
    } catch (error) {
      console.error('[OptionsView] Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <Box className="flex-1 relative bg-background-0">
      <ScrollablePage hasBanner={false}>
        {/* Title */}
        <Box
          className={`w-full max-w-[640px] px-4 pt-2 pb-1 ${
            isCenteredLayout ? 'self-center' : 'self-start'
          }`}
        >
          <PageTitle
            size="2xl"
            className={`${
              isCenteredLayout ? 'text-center' : 'text-left'
            } font-bold uppercase tracking-wide`}
          >
            Options
          </PageTitle>
        </Box>

        <Box className="gap-4 px-4 pt-4">
          {/* Steam API Key Card */}
          <Card
            variant="elevated"
            className="w-full max-w-[640px] self-center p-4 gap-2 rounded-md"
            testID="options-steam-api-key-card"
          >
            <Text className="text-sm font-semibold text-typography-0">Steam API Key</Text>
            <Text className="text-xs text-typography-400">
              Update your Steam API Key. The key is validated against your Steam ID.
            </Text>
            <GLTextInput
              label="New API Key"
              placeholder="Enter your Steam API Key"
              value={newSteamApiKey}
              onChangeText={(v) => {
                setNewSteamApiKey(v);
                setApiKeyFeedback(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={false}
            />
            {apiKeyFeedback && (
              <Text
                className={`text-xs ${
                  apiKeyFeedback.type === 'success' ? 'text-success-600' : 'text-error-600'
                }`}
                testID="options-steam-api-key-feedback"
              >
                {apiKeyFeedback.message}
              </Text>
            )}
            <Button
              isOnCard
              variant="outline"
              action="primary"
              onPress={handleUpdateSteamApiKey}
              isDisabled={updatingApiKey || newSteamApiKey.trim().length === 0}
              className="w-full flex-row items-center justify-center gap-2"
              testID="options-steam-api-key-save-btn"
            >
              <Ionicons name="key-outline" size={18} color="#93c5fd" />
              <ButtonText>{updatingApiKey ? 'Updating...' : 'Update API Key'}</ButtonText>
            </Button>
          </Card>

          {/* Theme Settings Card */}
          <Card
            variant="elevated"
            className={`w-full max-w-[640px] p-4 gap-2 rounded-md ${
              isCenteredLayout ? 'self-center' : 'self-start'
            }`}
          >
            <Text className="text-sm font-semibold text-typography-0">Theme Mode</Text>
            <Button
              isOnCard
              variant="outline"
              action="primary"
              onPress={toggleTheme}
              className="w-full flex-row items-center justify-center gap-2"
              testID="options-theme-toggle-btn"
            >
              <Ionicons
                name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={textColor}
              />
              <ButtonText>Toggle Theme: {isDarkMode ? 'Dark' : 'Light'}</ButtonText>
            </Button>
          </Card>

          {/* Push Notifications Settings Card */}
          <Card
            variant="elevated"
            className="w-full max-w-[640px] self-center p-4 gap-2 rounded-md"
            testID="options-notifications-card"
          >
            <Text className="text-sm font-semibold text-typography-0">Push Notifications</Text>
            <Text className="text-xs text-typography-400">
              {notificationsEnabled
                ? 'Push notifications are active for this device.'
                : 'Receive notifications about friend requests, invites, and activity.'}
            </Text>
            <Button
              isOnCard
              variant={notificationsEnabled ? 'outline' : 'solid'}
              action={notificationsEnabled ? 'negative' : 'primary'}
              onPress={handleToggleNotifications}
              isDisabled={loadingNotifications}
              className="w-full flex-row items-center justify-center gap-2"
              testID="options-notifications-toggle-btn"
            >
              <Ionicons
                name={notificationsEnabled ? 'notifications-off-outline' : 'notifications-outline'}
                size={18}
                color={notificationsEnabled ? '#fca5a5' : '#ffffff'}
              />
              <ButtonText>
                {loadingNotifications
                  ? 'Updating...'
                  : notificationsEnabled
                    ? 'Disable Notifications'
                    : 'Enable Notifications'}
              </ButtonText>
            </Button>
          </Card>

          {/* Account / Session Management Card */}
          <Card
            variant="elevated"
            className={`w-full max-w-[640px] p-4 gap-2 rounded-md ${
              isCenteredLayout ? 'self-center' : 'self-start'
            }`}
          >
            <Text className="text-sm font-semibold text-typography-0">Account</Text>
            <Button
              isOnCard
              variant="solid"
              action="negative"
              onPress={() => setShowLogoutModal(true)}
              isDisabled={isLoggingOut}
              className="w-full flex-row items-center justify-center gap-2"
              testID="options-logout-btn"
            >
              <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
              <ButtonText>{isLoggingOut ? 'Logging out...' : 'Log Out'}</ButtonText>
            </Button>
          </Card>
        </Box>

        {/* Confirmation Modal */}
        <ActionConfirmModal
          isVisible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogout}
          title="Log Out"
          message="Are you sure you want to log out?"
          confirmLabel="Log Out"
          confirmVariant="destructive"
          testIDPrefix="options-logout"
        />
      </ScrollablePage>
    </Box>
  );
};
