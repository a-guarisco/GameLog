import ApiManager from '@gamelog/api-manager/apiManager';
import { useGetGameScreenshots } from '@gamelog/api-manager/useApi';
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

describe('useGetGameScreenshots', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads the first page with the initial cursor', async () => {
    mockApiManager.getGameScreenshots.mockResolvedValue(buildPage(['1', '2'], 'cursor-2'));

    const { result } = renderHook(() => useGetGameScreenshots('413150'));

    await waitFor(() => expect(result.current.isLoadingScreenshots).toBe(false));
    expect(mockApiManager.getGameScreenshots).toHaveBeenCalledWith('413150', '*', 50);
    expect(result.current.screenshots.map((c) => c.publishedfileid)).toEqual(['1', '2']);
    expect(result.current.totalScreenshots).toBe(412249);
    expect(result.current.hasMoreScreenshots).toBe(true);
  });

  it('appends the next page and skips files already shown', async () => {
    mockApiManager.getGameScreenshots
      .mockResolvedValueOnce(buildPage(['1', '2'], 'cursor-2'))
      .mockResolvedValueOnce(buildPage(['2', '3'], 'cursor-3'));

    const { result } = renderHook(() => useGetGameScreenshots('413150'));
    await waitFor(() => expect(result.current.isLoadingScreenshots).toBe(false));

    await act(async () => result.current.loadMoreScreenshots());

    expect(mockApiManager.getGameScreenshots).toHaveBeenLastCalledWith('413150', 'cursor-2', 50);
    expect(result.current.screenshots.map((c) => c.publishedfileid)).toEqual(['1', '2', '3']);
  });

  it('stops paging when steam repeats the cursor', async () => {
    mockApiManager.getGameScreenshots
      .mockResolvedValueOnce(buildPage(['1'], 'cursor-2'))
      .mockResolvedValueOnce(buildPage(['2'], 'cursor-2'));

    const { result } = renderHook(() => useGetGameScreenshots('413150'));
    await waitFor(() => expect(result.current.isLoadingScreenshots).toBe(false));

    await act(async () => result.current.loadMoreScreenshots());
    expect(result.current.hasMoreScreenshots).toBe(false);

    await act(async () => result.current.loadMoreScreenshots());
    expect(mockApiManager.getGameScreenshots).toHaveBeenCalledTimes(2);
  });

  it('drops files with no image and survives an empty payload', async () => {
    mockApiManager.getGameScreenshots.mockResolvedValue({
      response: {
        total: 0,
        publishedfiledetails: [buildFile('1', { image_url: '' })],
      },
    });

    const { result } = renderHook(() => useGetGameScreenshots('413150'));

    await waitFor(() => expect(result.current.isLoadingScreenshots).toBe(false));
    expect(result.current.screenshots).toEqual([]);
    expect(result.current.hasMoreScreenshots).toBe(false);
  });

  it('reports the error message when the request fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApiManager.getGameScreenshots.mockRejectedValue(new Error('HTTP error: 429'));

    const { result } = renderHook(() => useGetGameScreenshots('413150'));

    await waitFor(() => expect(result.current.errorScreenshots).toBe(true));
    expect(result.current.errorMessageScreenshots).toBe('HTTP error: 429');
    expect(result.current.hasMoreScreenshots).toBe(false);
    consoleError.mockRestore();
  });

  it('uses custom fetcher when provided (Dependency Inversion)', async () => {
    const customFetcher = jest.fn().mockResolvedValue(buildPage(['99'], 'cursor-custom'));

    const { result } = renderHook(() => useGetGameScreenshots('413150', 20, customFetcher));

    await waitFor(() => expect(result.current.isLoadingScreenshots).toBe(false));
    expect(customFetcher).toHaveBeenCalledWith('413150', '*', 20);
    expect(mockApiManager.getGameScreenshots).not.toHaveBeenCalled();
    expect(result.current.screenshots.map((c) => c.publishedfileid)).toEqual(['99']);
  });
});
