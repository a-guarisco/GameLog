import { renderHook, act } from '@testing-library/react-native';
import { useFriendActions } from '@gamelog/social/social-view/useFriendActions';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager');

describe('useFriendActions', () => {
  const onFriendListChanged = jest.fn();
  const onSearchResultsChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles successful addFriend action', async () => {
    (ApiManager.addFriend as jest.Mock).mockResolvedValueOnce({ message: 'Success' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    await act(async () => {
      await result.current.handleAddFriend('u1');
    });

    expect(ApiManager.addFriend).toHaveBeenCalledWith('u1');
    expect(result.current.actionFeedback).toBe('Friend request sent successfully!');
    expect(onFriendListChanged).toHaveBeenCalled();
    expect(onSearchResultsChanged).toHaveBeenCalled();
    expect(result.current.isActionLoading).toBe(false);
  });

  it('handles addFriend error with fallback message', async () => {
    (ApiManager.addFriend as jest.Mock).mockRejectedValueOnce({});

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    await act(async () => {
      await result.current.handleAddFriend('u1');
    });

    expect(result.current.actionFeedback).toBe('Failed to send friend request');
    expect(result.current.isActionLoading).toBe(false);
  });

  it('handles acceptFriend success and error', async () => {
    (ApiManager.respondToFriend as jest.Mock).mockResolvedValueOnce({ message: 'Accepted' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    await act(async () => {
      await result.current.handleAcceptFriend('f1');
    });

    expect(ApiManager.respondToFriend).toHaveBeenCalledWith('f1', 'ACCEPTED');
    expect(result.current.actionFeedback).toBe('Friend request accepted!');

    (ApiManager.respondToFriend as jest.Mock).mockRejectedValueOnce(new Error('Accept error'));
    await act(async () => {
      await result.current.handleAcceptFriend('f1');
    });
    expect(result.current.actionFeedback).toBe('Accept error');
  });

  it('handles refuseFriend success and error', async () => {
    (ApiManager.respondToFriend as jest.Mock).mockResolvedValueOnce({ message: 'Refused' });

    const { result } = renderHook(() =>
      useFriendActions({ onFriendListChanged, onSearchResultsChanged })
    );

    await act(async () => {
      await result.current.handleRefuseFriend('f1');
    });

    expect(ApiManager.respondToFriend).toHaveBeenCalledWith('f1', 'REJECTED');
    expect(result.current.actionFeedback).toBe('Friend request refused.');

    (ApiManager.respondToFriend as jest.Mock).mockRejectedValueOnce(new Error('Refuse error'));
    await act(async () => {
      await result.current.handleRefuseFriend('f1');
    });
    expect(result.current.actionFeedback).toBe('Refuse error');
  });
});
