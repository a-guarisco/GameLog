import { render, fireEvent } from '@testing-library/react-native';
import CompactGameList from '@gamelog/common/CompactGameList';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('CompactGameList', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders with sortedGameReports and handles click with resolved app_id and today_play_time', () => {
    const handleGamePress = jest.fn();
    const mockReports = [
      {
        app_id: '440',
        today_play_time: 120,
        streak: 3,
        days_played_count: 5,
        max_playtime_per_day: 180,
      },
    ];

    const { getByText, getByTestId } = renderWithProvider(
      <CompactGameList
        sortedGameReports={mockReports}
        gameNames={{ '440': 'Team Fortress 2' }}
        handleGamePress={handleGamePress}
      />
    );

    expect(getByText('Team Fortress 2')).toBeTruthy();
    expect(getByText(/Playtime:/)).toBeTruthy();
    expect(getByText(/Streak:/)).toBeTruthy();
    expect(getByText(/Days played:/)).toBeTruthy();
    expect(getByText(/Max\/day:/)).toBeTruthy();

    fireEvent.press(getByTestId('game-list-item'));
    expect(handleGamePress).toHaveBeenCalledWith('440', 120);
  });

  it('renders with items using appId / requester_play_time and custom detail_rows', () => {
    const handleGamePress = jest.fn();
    const mockItems = [
      {
        appId: '730',
        requester_play_time: 90,
        testID: 'custom-item-730',
        detail_rows: [
          {
            label: 'Custom Label:',
            value: 'Custom Value',
            valueClassName: 'text-red-500',
          },
        ],
      },
    ];

    const { getByText, getByTestId } = renderWithProvider(
      <CompactGameList
        items={mockItems}
        gameNames={{}}
        handleGamePress={handleGamePress}
      />
    );

    expect(getByText('App ID: 730')).toBeTruthy();
    expect(getByText(/Custom Label:/)).toBeTruthy();
    expect(getByText('Custom Value')).toBeTruthy();


    fireEvent.press(getByTestId('custom-item-730'));
    expect(handleGamePress).toHaveBeenCalledWith('730', 90);
  });

  it('renders with gameSteamId and friend_play_time fallback', () => {
    const handleGamePress = jest.fn();
    const mockItems = [
      {
        gameSteamId: '570',
        friend_play_time: 60,
      },
    ];

    const { getByText, getByTestId } = renderWithProvider(
      <CompactGameList
        items={mockItems}
        gameNames={{ '570': 'Dota 2' }}
        handleGamePress={handleGamePress}
      />
    );

    expect(getByText('Dota 2')).toBeTruthy();
    fireEvent.press(getByTestId('game-list-item'));
    expect(handleGamePress).toHaveBeenCalledWith('570', 60);
  });

  it('handles empty list gracefully', () => {
    const handleGamePress = jest.fn();
    const { toJSON } = renderWithProvider(
      <CompactGameList gameNames={{}} handleGamePress={handleGamePress} />
    );

    expect(toJSON()).toBeTruthy();
  });
});
