import { render } from '@testing-library/react-native';
import { ErrorBox } from '@gamelog/common/feedbacks';

jest.mock('@react-native-vector-icons/ionicons', () => 'Icon');

describe('ErrorBox Component', () => {
  it('shows error title and message', () => {
    const message = 'Connection failed';
    const { getByText } = render(<ErrorBox errorMessage={message} />);

    expect(getByText('Error')).toBeTruthy();
    expect(getByText(message)).toBeTruthy();
  });

  it('shows only the title if errorMessage is null', () => {
    const { getByText, queryByText } = render(<ErrorBox errorMessage={null} />);

    expect(getByText('Error')).toBeTruthy();
    expect(queryByText('Connection failed')).toBeNull();
  });

  it('applies the className passed as a prop', () => {
    const { getByTestId } = render(
      <ErrorBox testID="error-box" errorMessage="ops" className="mt-5" />
    );
    const container = getByTestId('error-box');
    expect(container.props.className).toContain('mt-5');
  });
});
