import { render } from '@testing-library/react-native';
import { ViewGL } from '../../src/common';

describe('ViewGL', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<ViewGL testID="view-gl" />);
    expect(getByTestId('view-gl')).toBeTruthy();
  });
});
