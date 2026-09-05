import { renderHook } from '@testing-library/react-native';
import { useDeviceNotificationSync } from '../../src/notifications/useDeviceNotificationSync';
import * as pushService from '../../src/notifications/pushNotificationService';

jest.mock('../../src/notifications/pushNotificationService', () => ({
  syncDevicePushToken: jest.fn(() => Promise.resolve({ synced: true, token: 'token-123' })),
}));

describe('useDeviceNotificationSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when userId is undefined or empty', () => {
    renderHook(() => useDeviceNotificationSync(undefined));
    expect(pushService.syncDevicePushToken).not.toHaveBeenCalled();
  });

  it('calls syncDevicePushToken once when a valid userId is provided', () => {
    const { rerender } = renderHook(({ uid }) => useDeviceNotificationSync(uid), {
      initialProps: { uid: 'user-abc' },
    });

    expect(pushService.syncDevicePushToken).toHaveBeenCalledTimes(1);
    expect(pushService.syncDevicePushToken).toHaveBeenCalledWith('user-abc');

    // Re-rendering with the same userId should NOT trigger sync again
    rerender({ uid: 'user-abc' });
    expect(pushService.syncDevicePushToken).toHaveBeenCalledTimes(1);
  });

  it('triggers sync again if userId changes to a different user', () => {
    const { rerender } = renderHook(({ uid }) => useDeviceNotificationSync(uid), {
      initialProps: { uid: 'user-1' },
    });

    expect(pushService.syncDevicePushToken).toHaveBeenCalledWith('user-1');

    rerender({ uid: 'user-2' });
    expect(pushService.syncDevicePushToken).toHaveBeenCalledTimes(2);
    expect(pushService.syncDevicePushToken).toHaveBeenCalledWith('user-2');
  });
});
