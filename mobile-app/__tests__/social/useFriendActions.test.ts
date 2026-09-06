import { renderHook, act } from '@testing-library/react-native';
import { useFriendActions } from '@gamelog/social/social-view/useFriendActions';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager');

describe('useFriendActions', () => {
  const onFriendListChanged = jest.fn();
  const onSearchResultsChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('handles successful addFriend action and clears message after 3 seconds', async () => {
    (ApiManager.addFriend as jest.Mock).mockResolvedValueOnce({ message: 'Success' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleAddFriend('u1');
    });

    await act(async () => {
      await actionPromise;
    });

    expect(ApiManager.addFriend).toHaveBeenCalledWith('u1');
    expect(result.current.actionFeedback).toBe('Friend request sent successfully!');
    expect(onFriendListChanged).toHaveBeenCalled();
    expect(onSearchResultsChanged).toHaveBeenCalled();
    expect(result.current.isActionLoading).toBe(false);

    // Fast-forward 2.9 seconds - should still be there
    act(() => {
      jest.advanceTimersByTime(2900);
    });
    expect(result.current.actionFeedback).toBe('Friend request sent successfully!');

    // Advance remaining 100ms - should disappear
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.actionFeedback).toBeNull();
  });

  it('handles addFriend error with fallback message', async () => {
    (ApiManager.addFriend as jest.Mock).mockRejectedValueOnce({});

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleAddFriend('u1');
    });

    await act(async () => {
      await actionPromise;
    });

    expect(result.current.actionFeedback).toBe('Failed to send friend request');
    expect(result.current.isActionLoading).toBe(false);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.actionFeedback).toBeNull();
  });

  it('handles acceptFriend success and error', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({ message: 'Accepted' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleAcceptFriend('f1');
    });

    await act(async () => {
      await actionPromise;
    });

    expect(ApiManager.manageFriendship).toHaveBeenCalledWith('ACCEPT', 'f1');
    expect(result.current.actionFeedback).toBe('Friend request accepted!');

    // Test error
    (ApiManager.manageFriendship as jest.Mock).mockRejectedValueOnce(new Error('Accept error'));
    let actionPromiseError: Promise<void>;
    act(() => {
      actionPromiseError = result.current.handleAcceptFriend('f1');
    });
    await act(async () => {
      await actionPromiseError;
    });

    expect(result.current.actionFeedback).toBe('Accept error');
  });

  it('handles refuseFriend success and error', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({ message: 'Refused' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleRefuseFriend('f1');
    });

    await act(async () => {
      await actionPromise;
    });

    expect(ApiManager.manageFriendship).toHaveBeenCalledWith('REJECT', 'f1');
    expect(result.current.actionFeedback).toBe('Friend request refused.');

    // Test error
    (ApiManager.manageFriendship as jest.Mock).mockRejectedValueOnce(new Error('Refuse error'));
    let actionPromiseError: Promise<void>;
    act(() => {
      actionPromiseError = result.current.handleRefuseFriend('f1');
    });
    await act(async () => {
      await actionPromiseError;
    });

    expect(result.current.actionFeedback).toBe('Refuse error');
  });

  it('resets the 3-second timer if a new action is triggered', async () => {
    (ApiManager.addFriend as jest.Mock).mockResolvedValueOnce({ success: true });
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.handleAddFriend('user-1');
    });
    await act(async () => {
      await firstPromise;
    });

    expect(result.current.actionFeedback).toBe('Friend request sent successfully!');

    // Advance 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.actionFeedback).toBe('Friend request sent successfully!');

    // Fire second action
    let secondPromise: Promise<void>;
    act(() => {
      secondPromise = result.current.handleAcceptFriend('friendship-1');
    });
    await act(async () => {
      await secondPromise;
    });

    expect(result.current.actionFeedback).toBe('Friend request accepted!');

    // Advance 2 seconds from the second action (total 4 seconds from start)
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    // Should still be visible because timer was reset
    expect(result.current.actionFeedback).toBe('Friend request accepted!');

    // Advance 1 more second (3 seconds since second action)
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.actionFeedback).toBeNull();
  });

  it('sets error message on failure and clears it after 3 seconds', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockRejectedValueOnce(
      new Error('Network error occurred')
    );

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleRefuseFriend('friendship-99');
    });
    await act(async () => {
      await actionPromise;
    });

    expect(result.current.actionFeedback).toBe('Network error occurred');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.actionFeedback).toBeNull();
  });

  it('cleans up timeout on unmount', async () => {
    (ApiManager.manageFriendship as jest.Mock).mockResolvedValueOnce({ success: true });

    const { result, unmount } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    let actionPromise: Promise<void>;
    act(() => {
      actionPromise = result.current.handleRemoveFriend('friendship-1');
    });
    await act(async () => {
      await actionPromise;
    });

    expect(result.current.actionFeedback).toBe('Friend removed.');

    unmount();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    // It shouldn't crash or update state on unmounted component
  });
});
