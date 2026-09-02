import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';
import GameSectionTabs from '@gamelog/game/GameSectionTabs';
import { useGetGameGuides, useGetGameNews } from '@gamelog/api-manager/useApi';
import { formatShortDate } from '@gamelog/utils/formatUtils';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameNews: jest.fn(),
  useGetGameGuides: jest.fn(),
}));

const mockUseGetGameNews = useGetGameNews as jest.Mock;
const mockUseGetGameGuides = useGetGameGuides as jest.Mock;

const buildNewsItem = (overrides: Record<string, unknown> = {}) => ({
  gid: '1839676055882690',
  title: 'You can now play Stardew Valley in VR',
  url: 'https://steamstore-a.akamaihd.net/news/externalpost/PCGamesN/1839676055882690',
  is_external_url: true,
  author: 'Lauren Morton',
  contents: 'W',
  feedlabel: 'PC Gamer',
  date: 1785334609,
  feedname: 'PC Gamer',
  feed_type: 0,
  appid: 236390,
  ...overrides,
});

const mockNews = (
  newsitems: ReturnType<typeof buildNewsItem>[],
  state: { isLoading?: boolean; error?: boolean } = {}
) =>
  mockUseGetGameNews.mockReturnValue({
    gameNews: { appnews: { appid: 236390, newsitems, count: newsitems.length } },
    isLoadingGameNews: state.isLoading ?? false,
    errorGameNews: state.error ?? false,
    errorMessageGameNews: null,
  });

const buildGuide = (overrides: Record<string, unknown> = {}) => ({
  publishedfileid: '633984426',
  creator: '76561198028922089',
  consumer_appid: 236390,
  title: 'Stardew Valley 100% Achievement Guide',
  short_description: 'An achievement that empowers those who earn it.',
  image_url: '',
  preview_url: 'https://images.steamusercontent.com/ugc/448482024255283561/A2490/',
  image_width: 550,
  image_height: 550,
  time_created: 1457433495,
  file_type: 9,
  tags: [
    { tag: 'Gameplay Basics', display_name: 'Gameplay Basics' },
    { tag: 'english', display_name: 'English' },
    { tag: 'Walkthroughs', display_name: 'Walkthroughs' },
    { tag: 'Loot', display_name: 'Loot' },
    { tag: 'Crafting', display_name: 'Crafting' },
  ],
  views: 88013,
  lifetime_favorited: 7179,
  num_comments_public: 223,
  ...overrides,
});

const mockGuides = (
  publishedfiledetails: ReturnType<typeof buildGuide>[],
  state: { isLoading?: boolean; error?: boolean; total?: number } = {}
) =>
  mockUseGetGameGuides.mockReturnValue({
    gameGuides: {
      response: {
        total: state.total ?? publishedfiledetails.length,
        publishedfiledetails,
      },
    },
    isLoadingGameGuides: state.isLoading ?? false,
    errorGameGuides: state.error ?? false,
    errorMessageGameGuides: null,
  });

describe('GameSectionTabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNews([buildNewsItem()]);
    mockGuides([buildGuide()], { total: 812 });
  });

  const renderTabs = () =>
    render(<GameSectionTabs appid="236390" achievementsSlot={<Text>Achievements slot</Text>} />);

  it('shows the achievements slot first and marks that tab selected', () => {
    renderTabs();

    expect(screen.getByText('Achievements slot')).toBeTruthy();
    expect(screen.getByTestId('game-tab-achievements').props.accessibilityState.selected).toBe(
      true
    );
    expect(screen.getByTestId('game-tab-news').props.accessibilityState.selected).toBe(false);
  });

  it('swaps panels when another tab is pressed', () => {
    renderTabs();

    fireEvent.press(screen.getByTestId('game-tab-news'));
    expect(screen.queryByText('Achievements slot')).toBeNull();
    expect(screen.getByText('You can now play Stardew Valley in VR')).toBeTruthy();

    fireEvent.press(screen.getByTestId('game-tab-guides'));
    expect(screen.queryByText('You can now play Stardew Valley in VR')).toBeNull();
    expect(screen.getByText('Stardew Valley 100% Achievement Guide')).toBeTruthy();
  });

  it('links each panel out to the right Steam page for the app', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    renderTabs();

    fireEvent.press(screen.getByTestId('game-tab-news'));
    fireEvent.press(screen.getByText('See all news on Steam'));
    expect(openURL).toHaveBeenCalledWith('https://store.steampowered.com/news/app/236390');

    fireEvent.press(screen.getByTestId('game-tab-guides'));
    fireEvent.press(screen.getByText('See all guides on Steam'));
    expect(openURL).toHaveBeenCalledWith('https://steamcommunity.com/app/236390/guides/');

    openURL.mockRestore();
  });

  describe('news panel', () => {
    const openNewsTab = () => {
      renderTabs();
      fireEvent.press(screen.getByTestId('game-tab-news'));
    };

    it('asks for the five most recent items of the current game', () => {
      openNewsTab();

      expect(mockUseGetGameNews).toHaveBeenCalledWith('236390');
    });

    it('shows the byline, the short date and the title of every item', () => {
      mockNews([
        buildNewsItem(),
        buildNewsItem({ gid: '2', title: 'Patch 1.7 is live', date: 1784660983 }),
      ]);
      openNewsTab();

      expect(screen.getAllByText('Lauren Morton')).toHaveLength(2);
      // Built with the shared formatter so the assertion holds in any timezone.
      expect(screen.getByText(formatShortDate(1784660983))).toBeTruthy();
      expect(screen.getByText('Patch 1.7 is live')).toBeTruthy();
    });

    it('falls back to the feed label when steam sends an email or no author', () => {
      mockNews([
        buildNewsItem({ author: 'editor@pcgamesn.com', feedlabel: 'PCGamesN' }),
        buildNewsItem({ gid: '2', author: '', feedlabel: 'Community Announcements' }),
      ]);
      openNewsTab();

      expect(screen.getByText('PCGamesN')).toBeTruthy();
      expect(screen.getByText('Community Announcements')).toBeTruthy();
      expect(screen.queryByText('editor@pcgamesn.com')).toBeNull();
    });

    it('opens the item url when a news row is pressed', () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      openNewsTab();

      fireEvent.press(screen.getByTestId('news-item-1839676055882690'));

      expect(openURL).toHaveBeenCalledWith(
        'https://steamstore-a.akamaihd.net/news/externalpost/PCGamesN/1839676055882690'
      );
      openURL.mockRestore();
    });

    it('keeps the steam link reachable while loading', () => {
      mockNews([], { isLoading: true });
      openNewsTab();

      expect(screen.queryByText('No news yet')).toBeNull();
      expect(screen.getByText('See all news on Steam')).toBeTruthy();
    });

    it('reports a failed request and an empty feed', () => {
      mockNews([], { error: true });
      openNewsTab();
      expect(screen.getByText('Could not load news')).toBeTruthy();

      screen.unmount();
      mockNews([]);
      openNewsTab();
      expect(screen.getByText('No news yet')).toBeTruthy();
    });

    it('survives a payload with no appnews block', () => {
      mockUseGetGameNews.mockReturnValue({
        gameNews: null,
        isLoadingGameNews: false,
        errorGameNews: false,
        errorMessageGameNews: null,
      });
      openNewsTab();

      expect(screen.getByText('No news yet')).toBeTruthy();
    });
  });

  describe('guides panel', () => {
    const openGuidesTab = () => {
      renderTabs();
      fireEvent.press(screen.getByTestId('game-tab-guides'));
    };

    it('asks for the guides of the current game', () => {
      openGuidesTab();

      expect(mockUseGetGameGuides).toHaveBeenCalledWith('236390');
    });

    it('shows the title, the description and the counts of every guide', () => {
      openGuidesTab();

      expect(screen.getByText('Stardew Valley 100% Achievement Guide')).toBeTruthy();
      expect(screen.getByText('An achievement that empowers those who earn it.')).toBeTruthy();
      expect(screen.getByText('88,013')).toBeTruthy();
      expect(screen.getByText('7,179')).toBeTruthy();
      expect(screen.getByText('223')).toBeTruthy();
    });

    it('shows the first three tags and never a language one', () => {
      openGuidesTab();

      expect(screen.getByText('Gameplay Basics')).toBeTruthy();
      expect(screen.getByText('Walkthroughs')).toBeTruthy();
      expect(screen.getByText('Loot')).toBeTruthy();
      expect(screen.queryByText('English')).toBeNull();
      expect(screen.queryByText('Crafting')).toBeNull();
    });

    it('leaves out the description when steam sends an empty one', () => {
      mockGuides([buildGuide({ short_description: '' })]);
      openGuidesTab();

      expect(screen.queryByText('An achievement that empowers those who earn it.')).toBeNull();
      expect(screen.getByText('Stardew Valley 100% Achievement Guide')).toBeTruthy();
    });

    it('opens the steam page of the guide that was pressed', () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      openGuidesTab();

      fireEvent.press(screen.getByTestId('guide-item-633984426'));

      expect(openURL).toHaveBeenCalledWith(
        'https://steamcommunity.com/sharedfiles/filedetails/?id=633984426'
      );
      openURL.mockRestore();
    });

    it('reports a failed request and an empty feed', () => {
      mockGuides([], { error: true });
      openGuidesTab();
      expect(screen.getByText('Could not load guides')).toBeTruthy();

      screen.unmount();
      mockGuides([]);
      openGuidesTab();
      expect(screen.getByText('No guides yet')).toBeTruthy();
      expect(screen.getByText('See all guides on Steam')).toBeTruthy();
    });

    it('survives a payload with no response block', () => {
      mockUseGetGameGuides.mockReturnValue({
        gameGuides: null,
        isLoadingGameGuides: false,
        errorGameGuides: false,
        errorMessageGameGuides: null,
      });
      openGuidesTab();

      expect(screen.getByText('No guides yet')).toBeTruthy();
    });
  });

  describe('screenshots tab and sticky header', () => {
    it('renders 4 tabs when screenshotsSlot is provided', () => {
      render(
        <GameSectionTabs
          appid="236390"
          achievementsSlot={<Text>Achievements slot</Text>}
          screenshotsSlot={<Text>Screenshots slot</Text>}
          stickyHeader
        />
      );

      expect(screen.getByTestId('game-tab-achievements')).toBeTruthy();
      expect(screen.getByTestId('game-tab-news')).toBeTruthy();
      expect(screen.getByTestId('game-tab-guides')).toBeTruthy();
      expect(screen.getByTestId('game-tab-screenshots')).toBeTruthy();

      fireEvent.press(screen.getByTestId('game-tab-screenshots'));
      expect(screen.getByText('Screenshots slot')).toBeTruthy();
    });
  });
});
