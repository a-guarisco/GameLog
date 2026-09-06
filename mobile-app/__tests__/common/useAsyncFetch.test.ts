import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAsyncFetch } from '@gamelog/common/useAsyncFetch';

describe('useAsyncFetch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches data on mount and exposes it', async () => {
    const mockFn = jest.fn().mockResolvedValue('hello');
    const { result } = renderHook(() => useAsyncFetch(mockFn));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('hello');
    expect(result.current.error).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it('sets error state when the async function rejects', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAsyncFetch(mockFn));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(true);
    expect(result.current.errorMessage).toBe('boom');
  });

  it('sets a generic error message for non-Error rejections', async () => {
    const mockFn = jest.fn().mockRejectedValue('string-error');
    const { result } = renderHook(() => useAsyncFetch(mockFn));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.errorMessage).toBe('An error occurred while fetching data.');
  });

  it('refetch() returns a Promise that resolves after success', async () => {
    const mockFn = jest.fn().mockResolvedValue('data-1');
    const { result } = renderHook(() => useAsyncFetch(mockFn));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFn.mockResolvedValueOnce('data-2');

    await act(async () => {
      const promise = result.current.refetch();
      // Verify it returns a promise
      expect(promise).toBeInstanceOf(Promise);
      await promise;
    });

    expect(result.current.data).toBe('data-2');
    expect(result.current.isLoading).toBe(false);
  });

  it('refetch() returns a Promise that resolves (not rejects) on error', async () => {
    const mockFn = jest.fn().mockResolvedValue('ok');
    const { result } = renderHook(() => useAsyncFetch(mockFn));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockFn.mockRejectedValueOnce(new Error('refetch-error'));

    // Should not throw — the promise resolves even when the fetch fails
    await act(async () => {
      await expect(result.current.refetch()).resolves.toBeUndefined();
    });

    expect(result.current.error).toBe(true);
    expect(result.current.errorMessage).toBe('refetch-error');
  });

  it('ignores stale responses when refetch is called rapidly', async () => {
    let resolveFirst: (v: string) => void;
    let resolveSecond: (v: string) => void;

    const firstCall = new Promise<string>((r) => { resolveFirst = r; });
    const secondCall = new Promise<string>((r) => { resolveSecond = r; });

    const mockFn = jest.fn()
      .mockReturnValueOnce(Promise.resolve('initial'))
      .mockReturnValueOnce(firstCall)
      .mockReturnValueOnce(secondCall);

    const { result } = renderHook(() => useAsyncFetch(mockFn));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Fire two refetches rapidly
    act(() => {
      result.current.refetch(); // triggers firstCall
    });
    act(() => {
      result.current.refetch(); // triggers secondCall
    });

    // Resolve second first, then first
    await act(async () => {
      resolveSecond!('second');
    });

    expect(result.current.data).toBe('second');

    // Resolve the stale first call — should be ignored
    await act(async () => {
      resolveFirst!('first');
    });

    // Data should still be 'second', not overwritten by stale 'first'
    expect(result.current.data).toBe('second');
  });
});
