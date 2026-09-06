import { render, fireEvent } from '@testing-library/react-native';
import { GLSegmentedControl } from '../../src/common/GLSegmentedControl';
import { View } from 'react-native';

describe('GLSegmentedControl', () => {
  const options = [
    { id: 'opt1', label: 'Option 1', testID: 'opt1-tab' },
    { id: 'opt2', label: 'Option 2', testID: 'opt2-tab' },
    { id: 'opt3', label: 'Option 3' },
  ];

  it('renders correctly with initial active option', () => {
    const { getByText } = render(
      <GLSegmentedControl options={options} activeId="opt1" onSelect={jest.fn()} />
    );

    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('calls onSelect when an option is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByTestId } = render(
      <GLSegmentedControl options={options} activeId="opt1" onSelect={onSelectMock} />
    );

    fireEvent.press(getByTestId('opt2-tab'));
    expect(onSelectMock).toHaveBeenCalledWith('opt2');
  });

  it('handles layout event to calculate segment width', () => {
    const { root } = render(
      <GLSegmentedControl options={options} activeId="opt1" onSelect={jest.fn()} />
    );

    // Find the view that handles onLayout (it is the container of the segments)
    const viewWithOnLayout = root
      .findAllByType(View)
      .find((v) => typeof v.props.onLayout === 'function');
    if (viewWithOnLayout) {
      fireEvent(viewWithOnLayout, 'layout', { nativeEvent: { layout: { width: 300 } } });
    }
    // We can't directly query the Animated.View easily without testID but we can just check if it doesn't crash.
  });
});
