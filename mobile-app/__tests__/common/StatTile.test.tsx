import { render, fireEvent } from '@testing-library/react-native';
import { StatTile } from '../../src/common/StatTile';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('StatTile', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('renders value and label correctly', () => {
    const { getByText } = renderWithProvider(
      <StatTile
        value="42"
        label="ACHIEVEMENTS"
        className="custom-tile"
        valueClassName="custom-value"
        labelClassName="custom-label"
      />
    );

    expect(getByText('42')).toBeTruthy();
    expect(getByText('ACHIEVEMENTS')).toBeTruthy();
  });

  it('renders without label when label is omitted', () => {
    const { getByText, queryByText } = renderWithProvider(<StatTile value={100} />);

    expect(getByText('100')).toBeTruthy();
    expect(queryByText('ACHIEVEMENTS')).toBeNull();
  });

  it('updates font size on layout change', () => {
    const { getByText } = renderWithProvider(<StatTile value="85%" label="COMPLETION" />);

    const valElement = getByText('85%');
    // Simulate layout event with width 200
    fireEvent(valElement.parent?.parent || valElement, 'layout', {
      nativeEvent: {
        layout: { width: 200, height: 200, x: 0, y: 0 },
      },
    });

    expect(getByText('85%')).toBeTruthy();
    expect(getByText('COMPLETION')).toBeTruthy();
  });
});
