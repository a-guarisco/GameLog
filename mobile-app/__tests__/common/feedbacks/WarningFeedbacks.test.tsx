import { render } from '@testing-library/react-native';
import { WarningBox } from '@gamelog/common/feedbacks';

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
