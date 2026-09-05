import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirebaseAuth } from '@gamelog/auth/firebaseClient';
import { signOutGoogle } from '@gamelog/auth/googleAuth';
import { clearAllSecureStorage } from '@gamelog/storage/secureStorage';
import { clearSteamApiKey } from '@gamelog/api-manager/steamApiKey';

import { Box } from '@gamelog/common/gluestack/box';
import { Text } from '@gamelog/common/gluestack/text';
import { Card } from '@gamelog/common/gluestack/card';
import { Button, ButtonText } from '@gamelog/common/button';

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

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setColorScheme(newTheme);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(getFirebaseAuth());
      await signOutGoogle();
      await AsyncStorage.clear();
      await clearAllSecureStorage();
      await clearSteamApiKey();
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
