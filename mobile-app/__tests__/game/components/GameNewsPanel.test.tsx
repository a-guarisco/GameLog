import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import GameNewsPanel from '@gamelog/game/GameNewsPanel';
import { useGetGameNews } from '@gamelog/api-manager/useApi';
import * as OrientationHook from '@gamelog/common/useOrientation';

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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });
  });

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

  it('fetches 8 news items in portrait mode', () => {
    mockUseGetGameNews.mockReturnValue({
      gameNews: { appnews: { newsitems: [] } },
      isLoadingGameNews: false,
      errorGameNews: false,
    });

    render(<GameNewsPanel appid="236390" />);

    expect(mockUseGetGameNews).toHaveBeenCalledWith('236390', 8);
  });

  it('fetches 5 news items in phone landscape mode', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: false,
      width: 844,
      height: 390,
    });

    mockUseGetGameNews.mockReturnValue({
      gameNews: { appnews: { newsitems: [] } },
      isLoadingGameNews: false,
      errorGameNews: false,
    });

    render(<GameNewsPanel appid="236390" />);

    expect(mockUseGetGameNews).toHaveBeenCalledWith('236390', 5);
  });

  it('fetches 8 news items in tablet landscape mode', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: true,
      width: 1280,
      height: 800,
    });

    mockUseGetGameNews.mockReturnValue({
      gameNews: { appnews: { newsitems: [] } },
      isLoadingGameNews: false,
      errorGameNews: false,
    });

    render(<GameNewsPanel appid="236390" />);

    expect(mockUseGetGameNews).toHaveBeenCalledWith('236390', 8);
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
