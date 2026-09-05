import { render } from '@testing-library/react-native';
import { InfoBox } from '@gamelog/common/feedbacks';

jest.mock('@react-native-vector-icons/ionicons', () => 'Icon');

describe('InfoBox Component', () => {
  it('shows info title and message', () => {
    const message = 'Connection failed';
    const { getByText } = render(<InfoBox message={message} />);

    expect(getByText('Info')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('applies the className passed as a prop', () => {
    const { getByTestId } = render(<InfoBox testID="info-box" message="ops" className="mt-5" />);
    const container = getByTestId('info-box');
    expect(container.props.className).toContain('mt-5');
  });
});
