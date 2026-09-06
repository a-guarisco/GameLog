import { render } from '@testing-library/react-native';
import { SuccessBox } from '@gamelog/common/feedbacks';

jest.mock('@react-native-vector-icons/ionicons', () => 'Icon');

describe('SuccessBox Component', () => {
  it('SuccessBox shows title and message', () => {
    const message = 'Backend is reachable';
    const { getByText } = render(<SuccessBox message={message} />);

    expect(getByText('Success')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('applies the className passed as a prop', () => {
    const { getByTestId } = render(
      <SuccessBox testID="success-box" message="ops" className="mt-5" />
    );

    const container = getByTestId('success-box');
    expect(container.props.className).toContain('mt-5');
  });
});
