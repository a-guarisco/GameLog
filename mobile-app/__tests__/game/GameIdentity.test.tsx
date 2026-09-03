import { render } from '@testing-library/react-native';
import GameIdentity from '@gamelog/game/GameIdentity';
import { Text } from 'react-native';

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View testID="banner-box" {...props} /> };
});

jest.mock('@gamelog/common/gluestack/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text> };
});

jest.mock('@gamelog/common/gluestack/vstack', () => {
  const { View } = jest.requireActual('react-native');
  return {
    VStack: ({ children, className, ...props }: any) => (
      <View testID="vstack" {...props}>
        {children}
      </View>
    ),
  };
});

describe('GameIdentity', () => {
  const defaultProps = {
    title: 'My Game',
  };

  describe('required props', () => {
    it('renders without crashing with only title', () => {
      const { getByTestId } = render(<GameIdentity {...defaultProps} />);
      expect(getByTestId('vstack')).toBeTruthy();
    });

    it('displays the title text', () => {
      const { getByText } = render(<GameIdentity title="Zelda" />);
      expect(getByText('Zelda')).toBeTruthy();
    });
  });

  describe('optional props', () => {
    it('renders secondaryText when provided', () => {
      const { getByText } = render(<GameIdentity {...defaultProps} secondaryText="RPG" />);
      expect(getByText('RPG')).toBeTruthy();
    });

    it('renders custom chips when provided', () => {
      const { getByText } = render(
        <GameIdentity {...defaultProps} chips={<Text>Custom Chip</Text>} />
      );
      expect(getByText('Custom Chip')).toBeTruthy();
    });
  });

  describe('className props', () => {
    it('accepts custom className override', () => {
      const { getAllByTestId } = render(<GameIdentity {...defaultProps} className="bg-red-500" />);
      expect(getAllByTestId('banner-box')[0].props.className).toContain('bg-red-500');
    });

    it('accepts textClassName prop', () => {
      const { getByText } = render(<GameIdentity {...defaultProps} textClassName="text-white" />);
      expect(getByText(defaultProps.title).props.className).toContain('text-white');
    });
  });
});
