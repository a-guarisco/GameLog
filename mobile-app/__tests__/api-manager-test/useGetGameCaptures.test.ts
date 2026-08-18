import ApiManager from '@gamelog/api-manager/apiManager';
import { useGetGameCaptures } from '@gamelog/api-manager/useApi';
import { PublishedFiles } from '@gamelog/api-manager/dto';
import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('@gamelog/api-manager/apiManager');

const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

const buildFile = (id: string, overrides: Record<string, unknown> = {}) => ({
  publishedfileid: id,
  creator: '7656119',
  consumer_appid: 413150,
  title: '',
  short_description: `caption ${id}`,
  image_url: `https://images.steamusercontent.com/ugc/${id}/`,
  preview_url: `https://images.steamusercontent.com/ugc/${id}/preview/`,
  image_width: 1920,
  image_height: 1080,
  time_created: 1787031866,
  file_type: 5,
  ...overrides,
});

const buildPage = (
  ids: string[],
  nextCursor: string | undefined,
  total = 412249
): PublishedFiles => ({
  response: {
    total,
    publishedfiledetails: ids.map((id) => buildFile(id)),
    next_cursor: nextCursor,
  },
});

describe('useGetGameCaptures', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads the first page with the initial cursor', async () => {
    mockApiManager.getGameCaptures.mockResolvedValue(buildPage(['1', '2'], 'cursor-2'));

    const { result } = renderHook(() => useGetGameCaptures('413150'));

    await waitFor(() => expect(result.current.isLoadingCaptures).toBe(false));
    expect(mockApiManager.getGameCaptures).toHaveBeenCalledWith('413150', '*', 50);
    expect(result.current.captures.map((c) => c.publishedfileid)).toEqual(['1', '2']);
    expect(result.current.totalCaptures).toBe(412249);
    expect(result.current.hasMoreCaptures).toBe(true);
  });

  it('appends the next page and skips files already shown', async () => {
    mockApiManager.getGameCaptures
      .mockResolvedValueOnce(buildPage(['1', '2'], 'cursor-2'))
      .mockResolvedValueOnce(buildPage(['2', '3'], 'cursor-3'));

    const { result } = renderHook(() => useGetGameCaptures('413150'));
    await waitFor(() => expect(result.current.isLoadingCaptures).toBe(false));

    await act(async () => result.current.loadMoreCaptures());

    expect(mockApiManager.getGameCaptures).toHaveBeenLastCalledWith('413150', 'cursor-2', 50);
    expect(result.current.captures.map((c) => c.publishedfileid)).toEqual(['1', '2', '3']);
  });

  it('stops paging when steam repeats the cursor', async () => {
    mockApiManager.getGameCaptures
      .mockResolvedValueOnce(buildPage(['1'], 'cursor-2'))
      .mockResolvedValueOnce(buildPage(['2'], 'cursor-2'));

    const { result } = renderHook(() => useGetGameCaptures('413150'));
    await waitFor(() => expect(result.current.isLoadingCaptures).toBe(false));

    await act(async () => result.current.loadMoreCaptures());
    expect(result.current.hasMoreCaptures).toBe(false);

    await act(async () => result.current.loadMoreCaptures());
    expect(mockApiManager.getGameCaptures).toHaveBeenCalledTimes(2);
  });

  it('drops files with no image and survives an empty payload', async () => {
    mockApiManager.getGameCaptures.mockResolvedValue({
      response: {
        total: 0,
        publishedfiledetails: [buildFile('1', { image_url: '' })],
      },
    });

    const { result } = renderHook(() => useGetGameCaptures('413150'));

    await waitFor(() => expect(result.current.isLoadingCaptures).toBe(false));
    expect(result.current.captures).toEqual([]);
    expect(result.current.hasMoreCaptures).toBe(false);
  });

  it('reports the error message when the request fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiManager.getGameCaptures.mockRejectedValue(new Error('HTTP error: 429'));

    const { result } = renderHook(() => useGetGameCaptures('413150'));

    await waitFor(() => expect(result.current.errorCaptures).toBe(true));
    expect(result.current.errorMessageCaptures).toBe('HTTP error: 429');
    expect(result.current.hasMoreCaptures).toBe(false);
    consoleError.mockRestore();
  });

  it('uses custom fetcher when provided (Dependency Inversion)', async () => {
    const customFetcher = jest.fn().mockResolvedValue(buildPage(['99'], 'cursor-custom'));

    const { result } = renderHook(() => useGetGameCaptures('413150', 20, customFetcher));

    await waitFor(() => expect(result.current.isLoadingCaptures).toBe(false));
    expect(customFetcher).toHaveBeenCalledWith('413150', '*', 20);
    expect(mockApiManager.getGameCaptures).not.toHaveBeenCalled();
    expect(result.current.captures.map((c) => c.publishedfileid)).toEqual(['99']);
  });
});
