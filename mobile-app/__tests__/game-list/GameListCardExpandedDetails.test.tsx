import React from 'react';
import { render } from '@testing-library/react-native';
import { GameListCardExpandedDetails } from '@gamelog/game-list/GameListCardExpandedDetails';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const mockGameItem = {
  appid: 1,
  name: 'Test Game',
  playtime_forever: 100,
  playtime_windows_forever: 50,
  playtime_mac_forever: 20,
  playtime_linux_forever: 30,
  playtime_deck_forever: 10,
  rtime_last_played: 1672531200, // 2023-01-01
  has_community_visible_stats: true,
  img_icon_url: 'icon.png',
  genres: ['Action', 'Adventure'],
  maxPlaytimePerDay: 50,
  streak: 3,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('GameListCardExpandedDetails', () => {
  it('renders correctly with all data', () => {
    const { getByText, getAllByText } = render(
      <GameListCardExpandedDetails
        gameItem={mockGameItem}
        exactDateString="Jan 1, 2023"
        platforms={[
          { name: 'Windows', time: 50, iconName: 'logo-windows' },
          { name: 'Mac', time: 20, iconName: 'logo-apple' },
        ]}
      />,
      { wrapper }
    );

    expect(getByText(/Jan 1, 2023/)).toBeTruthy();
    expect(getByText('Action, Adventure')).toBeTruthy();
    expect(getByText('Windows')).toBeTruthy();
    expect(getAllByText('50m')).toBeTruthy();
    expect(getByText('Mac')).toBeTruthy();
    expect(getByText('20m')).toBeTruthy();
  });

  it('renders correctly with no last played date', () => {
    const { getByText } = render(
      <GameListCardExpandedDetails
        gameItem={{ ...mockGameItem, rtime_last_played: 0 }}
        exactDateString="Never"
        platforms={[]}
      />,
      { wrapper }
    );

    expect(getByText('Never')).toBeTruthy();
  });

  it('renders correctly with no genres', () => {
    const { getByText } = render(
      <GameListCardExpandedDetails
        gameItem={{ ...mockGameItem, genres: [] }}
        exactDateString="Jan 1, 2023"
        platforms={[]}
      />,
      { wrapper }
    );

    expect(getByText('None')).toBeTruthy();
  });
});
