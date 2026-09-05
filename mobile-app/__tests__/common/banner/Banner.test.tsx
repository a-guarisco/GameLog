import { render } from '@testing-library/react-native';
import Banner from '@gamelog/common/Banner';

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual('react-native');
  return { Box: (props: any) => <View testID="banner-box" {...props} /> };
});

jest.mock('@gamelog/common/gluestack/image', () => {
  const { Image: RNImage } = jest.requireActual('react-native');
  return {
    Image: (props: any) => <RNImage testID="banner-image" {...props} />,
  };
});

describe('Banner', () => {
  const defaultProps = {
    heightPercentage: 20,
    minHeight: 150,
  };

  describe('image rendering', () => {
    it('renders image when imageUrl is provided', () => {
      const { getByTestId } = render(
        <Banner {...defaultProps} imageUrl="https://example.com/banner.jpg" />
      );
      const image = getByTestId('banner-image');
      expect(image).toBeTruthy();
      expect(image.props.source).toEqual({ uri: 'https://example.com/banner.jpg' });
    });

    it('does not render image when imageUrl is not provided', () => {
      const { queryByTestId } = render(<Banner {...defaultProps} />);
      expect(queryByTestId('banner-image')).toBeNull();
    });
  });

  describe('style and layout', () => {
    it('applies the calculated height through style prop', () => {
      const { getByTestId } = render(<Banner {...defaultProps} />);
      const box = getByTestId('banner-box');

      // calculatedHeight = max((screenHeight * 20) / 100, 150)
      // In jest-environment screenHeight default is usually 1334 or 768
      expect(box.props.style).toHaveProperty('height');
      expect(box.props.style.height).toBeGreaterThanOrEqual(defaultProps.minHeight);
    });

    it('accepts custom className override', () => {
      const { getByTestId } = render(<Banner {...defaultProps} className="bg-red-500" />);
      const box = getByTestId('banner-box');
      expect(box.props.className).toContain('bg-red-500');
    });

    it('attaches panHandlers when scrollable=true', () => {
      const { getByTestId } = render(
        <Banner {...defaultProps} imageUrl="https://example.com/banner.jpg" scrollable={true} />
      );
      const box = getByTestId('banner-box');
      expect(box.props.onMoveShouldSetResponder).toBeDefined();
    });

    it('renders image properly when alignTop=true', () => {
      const { getByTestId } = render(
        <Banner {...defaultProps} imageUrl="https://example.com/banner.jpg" alignTop={true} />
      );
      const image = getByTestId('banner-image');
      expect(image).toBeTruthy();
    });
  });
});
