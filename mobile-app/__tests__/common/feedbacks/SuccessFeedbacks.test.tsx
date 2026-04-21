import { render } from '@testing-library/react-native';
import { SuccessBox, SuccessHeading, SuccessText } from '@gamelog/common/feedbacks';

describe('Success Texts', () => {
  it('SuccessHeading renders message correctly', () => {
    const { getByText } = render(<SuccessHeading message="All good" />);
    expect(getByText('All good')).toBeTruthy();
  });

  it('SuccessText renders message correctly', () => {
    const { getByText } = render(<SuccessText message="Operation completed" />);
    expect(getByText('Operation completed')).toBeTruthy();
  });
});

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
