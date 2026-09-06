import { render, fireEvent } from '@testing-library/react-native';
import { FriendRecommendationsContent } from '@gamelog/social/social-view/recommendations/FriendRecommendationsContent';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('FriendRecommendationsContent', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders LoadingBox when isLoading is true', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsContent
        isLoading={true}
        error={null}
        friendName="Bob"
        gameNames={{}}
        onCommonGamePress={jest.fn()}
        onTopGamePress={jest.fn()}
      />
    );

    expect(getByText('Analyzing games for Bob...')).toBeTruthy();
  });

  it('renders ErrorBox when error occurs', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsContent
        isLoading={false}
        error={new Error('Failed')}
        errorMessage="Network failure"
        friendName="Bob"
        gameNames={{}}
        onCommonGamePress={jest.fn()}
        onTopGamePress={jest.fn()}
      />
    );

    expect(getByText('Network failure')).toBeTruthy();
  });

  it('renders default error message if errorMessage is empty', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsContent
        isLoading={false}
        error={new Error('Failed')}
        friendName="Bob"
        gameNames={{}}
        onCommonGamePress={jest.fn()}
        onTopGamePress={jest.fn()}
      />
    );

    expect(getByText('Failed to load recommendations')).toBeTruthy();
  });

  it('renders InfoBox when recommendations are empty', () => {
    const { getByText } = renderWithProvider(
      <FriendRecommendationsContent
        recommendations={{ common_genres: [], common_games: [], top_games: [] }}
        isLoading={false}
        error={null}
        friendName="Bob"
        gameNames={{}}
        onCommonGamePress={jest.fn()}
        onTopGamePress={jest.fn()}
      />
    );

    expect(getByText('No recommendation data available with Bob.')).toBeTruthy();
  });

  it('renders genres, common games, and top games sections', () => {
    const onCommonGamePress = jest.fn();
    const onTopGamePress = jest.fn();

    const mockRecs: any = {
      common_genres: [{ id: '1', description: 'Action' }],
      common_games: [
        {
          gameSteamId: '440',
          requester_play_time: 120,
          friend_play_time: 240,
        },
      ],
      top_games: [
        {
          gameSteamId: '730',
          recommendation_score: 9.5,
          reason: 'Loved by friend',
        },
      ],
    };

    const { getByText } = renderWithProvider(
      <FriendRecommendationsContent
        recommendations={mockRecs}
        isLoading={false}
        error={null}
        friendName="Bob"
        gameNames={{ '440': 'Team Fortress 2', '730': 'Counter-Strike 2' }}
        onCommonGamePress={onCommonGamePress}
        onTopGamePress={onTopGamePress}
      />
    );

    expect(getByText('Shared Genres')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
    expect(getByText('Team Fortress 2')).toBeTruthy();
    expect(getByText('Counter-Strike 2')).toBeTruthy();
  });
});
