import { render, fireEvent } from '@testing-library/react-native';
import ExpandToggle from '@gamelog/common/ExpandToggle';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import * as ReactNative from 'react-native';

describe('ExpandToggle', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders collapsed state with default label and handles onToggle', () => {
    const onToggle = jest.fn();
    const { getByText, getByTestId } = renderWithProvider(
      <ExpandToggle isExpanded={false} onToggle={onToggle} testID="expand-toggle" />
    );

    expect(getByText('See details')).toBeTruthy();
    fireEvent.press(getByTestId('expand-toggle'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('renders expanded state with custom labels and dark mode', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValueOnce('dark');
    const onToggle = jest.fn();
    const { getByText } = renderWithProvider(
      <ExpandToggle
        isExpanded={true}
        onToggle={onToggle}
        labelCollapsed="Show more"
        labelExpanded="Show less"
        className="custom-toggle"
      />
    );

    expect(getByText('Show less')).toBeTruthy();
  });
});
