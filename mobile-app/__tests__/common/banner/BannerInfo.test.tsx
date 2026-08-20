import { render } from '@testing-library/react-native';
import BannerInfo from '@gamelog/common/BannerInfo';

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View testID="banner-box" {...props} /> };
});

jest.mock('@gamelog/common/gluestack/text', () => {
  const { Text } = jest.requireActual('react-native');
  return { Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text> };
});

jest.mock('@gamelog/common/gluestack/hstack', () => {
  const { View } = jest.requireActual('react-native');
  return {
    HStack: ({ children, className, ...props }: any) => (
      <View testID="hstack" {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('@gamelog/common/gluestack/avatar', () => {
  const { View, Text, Image } = jest.requireActual('react-native');
  return {
    Avatar: ({ children, size, ...props }: any) => (
      <View testID="avatar" {...props}>
        {children}
      </View>
    ),
    AvatarFallbackText: ({ children }: any) => <Text testID="avatar-fallback">{children}</Text>,
    AvatarImage: ({ source, alt, ...props }: any) => (
      <Image source={source} accessibilityLabel={alt} testID="avatar-image" {...props} />
    ),
  };
});

const url = 'https://ui-avatars.com/api/?name=Sam+G';

describe('BannerInfo', () => {
  const defaultProps = {
    title: 'My Game',
  };

  describe('required props', () => {
    it('renders without crashing with only title', () => {
      const { getByTestId } = render(<BannerInfo {...defaultProps} />);
      expect(getByTestId('hstack')).toBeTruthy();
    });

    it('displays the title text', () => {
      const { getAllByText } = render(<BannerInfo title="Zelda" />);
      // getAllByText[0] seleziona il titolo principale nel centro
      expect(getAllByText('Zelda')[0]).toBeTruthy();
    });

    it('uses title as avatar fallback text', () => {
      const { getByTestId } = render(<BannerInfo title="Zelda" iconUrl={url} />);
      expect(getByTestId('avatar-fallback').props.children).toBe('Zelda');
    });
  });

  describe('optional props', () => {
    it('renders secondaryText when provided', () => {
      const { getByText } = render(<BannerInfo {...defaultProps} secondaryText="RPG" />);
      expect(getByText('RPG')).toBeTruthy();
    });

    it('renders without secondaryText when not provided', () => {
      const { getAllByText } = render(<BannerInfo {...defaultProps} />);
      expect(getAllByText(defaultProps.title)[0]).toBeTruthy();
    });

    it('renders avatar image with correct source when iconUrl is provided', () => {
      const { getByTestId } = render(<BannerInfo {...defaultProps} iconUrl={url} />);
      expect(getByTestId('avatar-image').props.source).toEqual({ uri: url });
    });

    it('sets correct alt text on avatar image', () => {
      const { getByTestId } = render(
        <BannerInfo title="Zelda" iconUrl="https://example.com/icon.png" />
      );
      expect(getByTestId('avatar-image').props.accessibilityLabel).toBe('Zelda icon');
    });
  });

  describe('className props', () => {
    it('accepts custom className override', () => {
      const { getAllByTestId } = render(<BannerInfo {...defaultProps} className="bg-red-500" />);
      expect(getAllByTestId('banner-box')[0]).toBeTruthy();
    });

    it('accepts textClassName prop', () => {
      const { getAllByText } = render(<BannerInfo {...defaultProps} textClassName="text-white" />);
      expect(getAllByText(defaultProps.title)[0]).toBeTruthy();
    });
  });

  describe('avatar', () => {
    it('renders the Avatar component when an icon is provided', () => {
      const { getByTestId } = render(<BannerInfo {...defaultProps} iconUrl={url} />);
      expect(getByTestId('avatar')).toBeTruthy();
    });

    it('leaves the avatar out entirely when there is no iconUrl', () => {
      const { queryByTestId } = render(<BannerInfo {...defaultProps} />);
      expect(queryByTestId('avatar')).toBeNull();
      expect(queryByTestId('avatar-image')).toBeNull();
    });

    it('keeps the title centred without an icon', () => {
      const { getAllByTestId } = render(<BannerInfo {...defaultProps} />);
      // The empty left slot survives so the centre column does not shift.
      expect(getAllByTestId('banner-box').length).toBe(3);
    });
  });
});
