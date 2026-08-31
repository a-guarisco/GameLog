import { render, screen, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import GameGuidesPanel from '@gamelog/game/GameGuidesPanel';
import { useGetGameGuides } from '@gamelog/api-manager/useApi';

jest.mock('@gamelog/api-manager/useApi', () => ({
  useGetGameGuides: jest.fn(),
}));

const mockUseGetGameGuides = useGetGameGuides as jest.Mock;

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
    { tag: 'Walkthroughs', display_name: 'Walkthroughs' },
  ],
  views: 88013,
  lifetime_favorited: 7179,
  num_comments_public: 223,
  ...overrides,
});

describe('GameGuidesPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders guide items and details correctly', () => {
    mockUseGetGameGuides.mockReturnValue({
      gameGuides: {
        response: {
          total: 100,
          publishedfiledetails: [buildGuide()],
        },
      },
      isLoadingGameGuides: false,
      errorGameGuides: false,
    });

    render(<GameGuidesPanel appid="236390" />);

    expect(screen.getByText('Stardew Valley 100% Achievement Guide')).toBeTruthy();
    expect(screen.getByText('An achievement that empowers those who earn it.')).toBeTruthy();
    expect(screen.getByText('See all guides on Steam')).toBeTruthy();
  });

  it('opens guide external URL on card click', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockUseGetGameGuides.mockReturnValue({
      gameGuides: {
        response: {
          total: 1,
          publishedfiledetails: [buildGuide()],
        },
      },
      isLoadingGameGuides: false,
      errorGameGuides: false,
    });

    render(<GameGuidesPanel appid="236390" />);

    fireEvent.press(screen.getByTestId('guide-item-633984426'));
    expect(openURL).toHaveBeenCalledWith(
      'https://steamcommunity.com/sharedfiles/filedetails/?id=633984426'
    );

    openURL.mockRestore();
  });
});
