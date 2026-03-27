import { render } from '@testing-library/react-native';
import { WarningBox, WarningHeading, WarningText } from '@gamelog/common/feedbacks';

describe('Warning Texts', () => {
  it('WarningHeading renders message correctly', () => {
    const { getByText } = render(<WarningHeading message="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('WarningText renders message correctly', () => {
    const { getByText } = render(<WarningText message="Detailed warning description" />);
    expect(getByText('Detailed warning description')).toBeTruthy();
  });
});

jest.mock('@react-native-vector-icons/ionicons', () => 'Icon');

describe('WarningBox Component', () => {
  it('shows warning title and message', () => {
    const message = 'Connection failed';
    const { getByText } = render(<WarningBox message={message} />);

    expect(getByText('Warning')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('applies the className passed as a prop', () => {
    const { getByTestId } = render(
      <WarningBox testID="warning-box" message="ops" className="mt-5" />
    );
    const container = getByTestId('warning-box');
    expect(container.props.className).toContain('mt-5');
  });
});
