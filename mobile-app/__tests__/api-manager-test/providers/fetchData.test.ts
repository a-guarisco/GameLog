import { fetchData } from '@gamelog/api-manager/providers/fetchData';

describe('fetchData', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });

  it('returns parsed JSON when response is ok', async () => {
    const payload = { value: 42 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    });

    const result = await fetchData<typeof payload>('https://example.dev/test');

    expect(mockFetch).toHaveBeenCalledWith('https://example.dev/test');
    expect(result).toEqual(payload);
  });

  it('throws descriptive error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchData('https://example.dev/missing')).rejects.toThrow(
      'HTTP error: 404. url Called: https://example.dev/missing'
    );
  });

  it('propagates fetch rejection errors', async () => {
    const networkError = new Error('Network down');
    mockFetch.mockRejectedValueOnce(networkError);

    await expect(fetchData('https://example.dev/error')).rejects.toThrow('Network down');
  });
});
