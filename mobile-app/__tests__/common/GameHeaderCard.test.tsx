import { render, fireEvent } from '@testing-library/react-native';
import { GameHeaderCard } from '@gamelog/common/GameHeaderCard';
import { steamAssetUrls } from '@gamelog/api-manager/steamAssets';
import { Text } from 'react-native';

jest.mock('@gamelog/api-manager/steamAssets', () => ({
  steamAssetUrls: {
    getGameHeaderImage: jest.fn(
      (appid) => `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
    ),
  },
}));

jest.mock('@gamelog/common/gluestack/card', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Card: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Box: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@gamelog/common/gluestack/image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: (props: any) => <View {...props} testID="mock-image" />,
  };
});

describe('GameHeaderCard', () => {
  const mockProps = {
    name: 'Portal 2',
    appid: '620',
    onPress: jest.fn(),
  };

  it('renders correctly the game name', () => {
    const { getByText } = render(<GameHeaderCard {...mockProps} />);
    expect(getByText('Portal 2')).toBeTruthy();
  });

  it('calls the steam asset utility with the correct appid', () => {
    render(<GameHeaderCard {...mockProps} />);
    expect(steamAssetUrls.getGameHeaderImage).toHaveBeenCalledWith('620');
  });

  it('passes the correct image URL to the Image component', () => {
    const { getByTestId } = render(<GameHeaderCard {...mockProps} />);
    const image = getByTestId('mock-image');

    expect(image.props.source).toBe('https://cdn.akamai.steamstatic.com/steam/apps/620/header.jpg');
  });

  it('renders correctly the child components (children)', () => {
    const { getByText } = render(
      <GameHeaderCard {...mockProps}>
        <Text>Extra Content</Text>
      </GameHeaderCard>
    );
    expect(getByText('Extra Content')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByRole } = render(<GameHeaderCard {...mockProps} />);
    const pressable = getByRole('button', { name: /view details for portal 2/i });

    fireEvent.press(pressable);
    expect(mockProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('has the correct accessibility properties', () => {
    const { getByLabelText } = render(<GameHeaderCard {...mockProps} />);
    expect(getByLabelText('View details for Portal 2')).toBeTruthy();
  });
});
