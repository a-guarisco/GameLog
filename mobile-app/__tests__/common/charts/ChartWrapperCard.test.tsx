import * as ReactNative from 'react-native';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ChartWrapperCard from '@gamelog/common/charts/ChartWrapperCard';

jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

jest.mock('@gamelog/common/gluestack/gluestack-ui-provider/config', () => ({
  rawConfig: {
    light: { '--color-background-100': '255,255,255' },
    dark: { '--color-background-100': '0,0,0' },
  },
}));

jest.mock('@gamelog/common/gluestack/box', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Box: ({ children, ...props }: any) => <View {...props}>{children}</View> };
});

jest.mock('@gamelog/common/gluestack/card', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Card: ({ children, onLayout, ...props }: any) => (
      <View testID="card" onLayout={onLayout} {...props}>
        {children}
      </View>
    ),
  };
});

jest.mock('@gamelog/common/gluestack/spinner', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Spinner: () => <View testID="spinner" /> };
});

jest.mock('@gamelog/common/charts/ChartErrorHandler', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: ({ ErrorBehaviour }: { ErrorBehaviour?: React.ComponentType }) => {
      const Comp = ErrorBehaviour || (() => <View testID="default-error" />);
      return <Comp />;
    },
  };
});

const noop = () => null;
const defaultProps = { isLoading: false, error: false };

describe('ChartWrapperCard', () => {
  it('renders Spinner when isLoading is true', () => {
    render(
      <ChartWrapperCard {...defaultProps} isLoading={true}>
        {noop}
      </ChartWrapperCard>
    );
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders error component when error is true', () => {
    render(
      <ChartWrapperCard {...defaultProps} error={true}>
        {noop}
      </ChartWrapperCard>
    );
    expect(screen.getByTestId('default-error')).toBeTruthy();
  });

  it('renders Spinner when cardWidth is 0 (before layout)', () => {
    render(<ChartWrapperCard {...defaultProps}>{noop}</ChartWrapperCard>);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders children after a layout event provides a width', () => {
    const children = jest.fn(({ cardWidth, theme }) => <View testID="chart-content" />);
    render(
      <ChartWrapperCard isLoading={false} error={false}>
        {children}
      </ChartWrapperCard>
    );
    fireEvent(screen.getByTestId('card'), 'layout', {
      nativeEvent: { layout: { width: 300 } },
    });
    expect(screen.getByTestId('chart-content')).toBeTruthy();
    expect(children).toHaveBeenCalledWith(expect.objectContaining({ cardWidth: 300 }));
  });

  it('passes a custom ErrorBehaviour through to ChartErrorHandling', () => {
    const CustomError = () => <View testID="custom-error" />;
    render(
      <ChartWrapperCard {...defaultProps} error={true} ErrorBehaviour={CustomError}>
        {noop}
      </ChartWrapperCard>
    );
    expect(screen.getByTestId('custom-error')).toBeTruthy();
  });
});
