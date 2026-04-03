import { render } from '@testing-library/react-native';
import { LoadingBox } from '@gamelog/common/feedbacks/LoadingBox';

jest.mock('@gamelog/common/gluestack/spinner', () => ({
  Spinner: 'Spinner',
}));

describe('LoadingBox Component', () => {
  it('shows default loading message when no message is provided', () => {
    const { getByText } = render(<LoadingBox message={null} />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows custom message when provided', () => {
    const customMessage = 'Fetching your games...';
    const { getByText } = render(<LoadingBox message={customMessage} />);

    expect(getByText(customMessage)).toBeTruthy();
  });

  it('renders the Spinner', () => {
    const { render: renderActual } = jest.requireActual('@testing-library/react-native');
    const { UNSAFE_getByType } = renderActual(<LoadingBox message={null} />);

    expect(UNSAFE_getByType('Spinner')).toBeTruthy();
  });

  it('applies the correct className and supports extra props', () => {
    const { getByTestId } = render(
      <LoadingBox message={null} className="mt-10" testID="loading-container" />
    );

    const container = getByTestId('loading-container');
    expect(container.props.className).toContain('mt-10');
  });
});
