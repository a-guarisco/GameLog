import { render } from '@testing-library/react-native';
import TopNotchBlurOverlay from '@gamelog/common/TopNotchBlurOverlay';
import { Animated } from 'react-native';

jest.mock('@react-native-masked-view/masked-view', () => {
  const { View } = jest.requireActual('react-native');
  return ({ children, maskElement, style }: any) => (
    <View testID="mock-masked-view" style={style}>
      {maskElement}
      {children}
    </View>
  );
});

jest.mock('expo-blur', () => {
  const { View } = jest.requireActual('react-native');
  return {
    BlurView: ({ children, style, tint }: any) => (
      <View testID="mock-blur-view" accessibilityLabel={`tint-${tint}`} style={style}>
        {children}
      </View>
    ),
  };
});

describe('TopNotchBlurOverlay', () => {
  it('renders light mode blur overlay', () => {
    const dummyRef = { current: null };
    const animValue = new Animated.Value(0);
    const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const { getByTestId } = render(
      <TopNotchBlurOverlay blurTargetRef={dummyRef} height={60} opacity={opacity} isDark={false} />
    );

    expect(getByTestId('mock-masked-view')).toBeTruthy();
    expect(getByTestId('mock-blur-view').props.accessibilityLabel).toBe('tint-light');
  });

  it('renders dark mode blur overlay', () => {
    const dummyRef = { current: null };
    const animValue = new Animated.Value(1);
    const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

    const { getByTestId } = render(
      <TopNotchBlurOverlay blurTargetRef={dummyRef} height={80} opacity={opacity} isDark={true} />
    );

    expect(getByTestId('mock-blur-view').props.accessibilityLabel).toBe('tint-dark');
  });
});
