import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FirebaseDeviceNotificationTest } from '../../src/dev/FirebaseDeviceNotificationTest';
import {
  getStoredRegistration,
  requestAndRegisterPushToken,
  unregisterPushToken,
} from '@gamelog/notifications';
import * as Notifications from 'expo-notifications';

jest.mock('@gamelog/notifications', () => ({
  getStoredRegistration: jest.fn(() => Promise.resolve({ token: null, userId: null })),
  requestAndRegisterPushToken: jest.fn(() =>
    Promise.resolve({ success: true, token: 'mock-fcm-token' })
  ),
  unregisterPushToken: jest.fn(() => Promise.resolve({ success: true })),
  initNotificationChannel: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getDevicePushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-fcm-token' })),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('@gamelog/auth/firebaseClient', () => ({
  getFirebaseAuth: jest.fn(() => ({
    currentUser: { uid: 'dev-test-user-id' },
  })),
}));

describe('FirebaseDeviceNotificationTest Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state with empty device info', async () => {
    const { getByText, getByTestId } = render(<FirebaseDeviceNotificationTest />);

    await waitFor(() => {
      expect(getByText('No device registered yet for push notifications.')).toBeTruthy();
      expect(getByTestId('dev-register-device-btn')).toBeTruthy();
      expect(getByTestId('dev-unregister-device-btn')).toBeTruthy();
    });
  });

  it('registers device when register button is pressed', async () => {
    const { getByTestId, getByText } = render(<FirebaseDeviceNotificationTest />);
    const registerBtn = getByTestId('dev-register-device-btn');

    fireEvent.press(registerBtn);

    await waitFor(() => {
      expect(requestAndRegisterPushToken).toHaveBeenCalledWith('dev-test-user-id');
      expect(getByText(/Device successfully registered with Backend/)).toBeTruthy();
    });
  });

  it('unregisters device when unregister button is pressed', async () => {
    (getStoredRegistration as jest.Mock).mockResolvedValueOnce({
      token: 'mock-fcm-token',
      userId: 'dev-test-user-id',
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });

    const { getByTestId, getByText } = render(<FirebaseDeviceNotificationTest />);

    await waitFor(() => {
      expect(getByText(/mock-fcm-token/)).toBeTruthy();
    });

    const unregisterBtn = getByTestId('dev-unregister-device-btn');
    fireEvent.press(unregisterBtn);

    await waitFor(() => {
      expect(unregisterPushToken).toHaveBeenCalled();
      expect(getByText(/Device token successfully unregistered/)).toBeTruthy();
    });
  });
});
