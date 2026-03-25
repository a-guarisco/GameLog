import { render, screen } from '@testing-library/react-native';
import { Text } from '@gamelog/components/ui/text';
import ChartErrorHandler from '@gamelog/common/charts/ChartErrorHandler';

jest.mock('@gamelog/components/ui/box', () => ({
  Box: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@gamelog/components/ui/text', () => {
  const { Text: RNText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Text: ({ children }: { children?: React.ReactNode }) => <RNText>{children}</RNText>,
  };
});

describe('ChartErrorHandler', () => {
  it('renders the default fallback when no ErrorBehaviour is provided', () => {
    render(<ChartErrorHandler />);
    expect(screen.getByText('Error loading chart')).toBeTruthy();
  });

  it('renders the custom ErrorBehaviour component when provided', () => {
    const CustomError = () => <Text>Custom Error UI</Text>;
    render(<ChartErrorHandler ErrorBehaviour={CustomError} />);
    expect(screen.getByText('Custom Error UI')).toBeTruthy();
  });
});
