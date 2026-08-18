import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import GameNewsPanel from '@gamelog/game/GameNewsPanel';
import { useGetGameNews } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameNews: jest.fn(),
}));

const mockUseGetGameNews = useGetGameNews as jest.Mock;

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

describe('GameNewsPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders news items correctly', () => {
    mockUseGetGameNews.mockReturnValue({
      gameNews: { appnews: { newsitems: [buildNewsItem()] } },
      isLoadingGameNews: false,
      errorGameNews: false,
    });

    render(<GameNewsPanel appid="236390" />);

    expect(screen.getByText('You can now play Stardew Valley in VR')).toBeTruthy();
    expect(screen.getByText('Lauren Morton')).toBeTruthy();
  });

  it('opens news external URL on item click', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockUseGetGameNews.mockReturnValue({
      gameNews: { appnews: { newsitems: [buildNewsItem()] } },
      isLoadingGameNews: false,
      errorGameNews: false,
    });

    render(<GameNewsPanel appid="236390" />);

    fireEvent.press(screen.getByTestId('news-item-1839676055882690'));
    expect(openURL).toHaveBeenCalledWith(
      'https://steamstore-a.akamaihd.net/news/externalpost/PCGamesN/1839676055882690'
    );

    openURL.mockRestore();
  });
});
