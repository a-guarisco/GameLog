import { render } from '@testing-library/react-native';
import { InfoBox, InfoHeading, InfoText } from '@gamelog/common/feedbacks';

describe('Info Texts', () => {
  it('InfoHeading renders message correctly', () => {
    const { getByText } = render(<InfoHeading message="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('InfoText renders message correctly', () => {
    const { getByText } = render(<InfoText message="Detailed info description" />);
    expect(getByText('Detailed info description')).toBeTruthy();
  });
});

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
