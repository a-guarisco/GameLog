import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import OtherUserProfileView from '@gamelog/social/other-user-profile/OtherUserProfileView';
import ApiManager from '@gamelog/api-manager/apiManager';

jest.mock('@gamelog/api-manager/apiManager');
jest.mock('@gamelog/api-manager/steamApiKey', () => ({
  getSteamId: () => 'my-steam-id',
  getSteamApiKey: () => 'my-api-key',
}));

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
      canGoBack: () => true,
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock child chart components so we can verify they are rendered with correct props
jest.mock(
  '@gamelog/common/charts/community-playtime-histogram/CommunityPlaytimeHistogramChart',
  () => {
    const { Text } = require('react-native');
    return (props: any) => (
      <Text testID="mock-playtime-chart">{props.chartTitle || 'Playtime Chart'}</Text>
    );
  }
);

jest.mock(
  '@gamelog/common/charts/community-top-games-histogram/CommunityTopGamesHistogramChart',
  () => {
    const { Text } = require('react-native');
    return (props: any) => (
      <Text testID="mock-top-games-chart">{props.chartTitle || 'Top Games Chart'}</Text>
    );
  }
);

jest.mock(
  '@gamelog/common/charts/community-game-status/CommunityGameStatusChart',
  () => {
    const { Text } = require('react-native');
    return (props: any) => (
      <Text testID="mock-game-status-chart">{props.chartTitle || 'Status Chart'}</Text>
    );
  }
);

jest.mock(
  '@gamelog/common/charts/community-genre-radar/CommunityGenreRadarChart',
  () => {
    const { Text } = require('react-native');
    return (props: any) => (
      <Text testID="mock-genre-radar-chart">{props.chartTitle || 'Radar Chart'}</Text>
    );
  }
);

const mockApiManager = ApiManager as jest.Mocked<typeof ApiManager>;

describe('OtherUserProfileView', () => {
  const mockUser = {
    id: 'user-uuid-1',
    firebase_uid: 'fb-1',
    username: 'GamerGuy',
    steam_id: '76561198000000001',
    has_steam_api_key: true,
  };

  const mockFriendship = {
    friendship_id: 'f-1',
    friendship_status: 'accepted' as const,
    since: '01-02-2024',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApiManager.getPlayersInfo.mockResolvedValue({
      response: {
        players: [
          {
            steamid: '76561198000000001',
            personaname: 'GamerGuy Persona',
            avatarfull: 'https://example.com/avatar.jpg',
            timecreated: 1577836800,
          },
        ],
      },
    } as any);

    mockApiManager.getOwnedGames.mockResolvedValue({
      response: {
        game_count: 50,
        games: [
          { appid: 730, name: 'Counter-Strike', playtime_forever: 12000 },
          { appid: 570, name: 'Dota 2', playtime_forever: 6000 },
        ],
      },
    } as any);
  });

  it('renders user identity, relationship chip, and stats', async () => {
    render(<OtherUserProfileView user={mockUser} friendship={mockFriendship} />);

    expect(await screen.findByText('GamerGuy Persona')).toBeTruthy();
    expect(screen.getByTestId('other-user-status-chip')).toBeTruthy();
    expect(screen.getAllByText('Friend')).toHaveLength(2);
    expect(screen.getByTestId('other-user-stat-band')).toBeTruthy();
    expect(screen.getByText('Owned')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });

  it('renders all 4 comparison charts with personalized user titles', async () => {
    render(<OtherUserProfileView user={mockUser} friendship={mockFriendship} />);

    expect(screen.getByText("GamerGuy's Playtime")).toBeTruthy();
    expect(screen.getByText("GamerGuy's Top Games")).toBeTruthy();
    expect(screen.getByText('Library Status Breakdown')).toBeTruthy();
    expect(screen.getByText("GamerGuy's Radar")).toBeTruthy();
  });

  it('navigates back when back button is pressed', async () => {
    render(<OtherUserProfileView user={mockUser} friendship={mockFriendship} />);

    fireEvent.press(screen.getByTestId('other-user-profile-back-btn'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
