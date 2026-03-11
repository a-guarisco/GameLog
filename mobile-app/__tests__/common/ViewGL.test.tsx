import { ViewGL } from '../../src/common';
import { renderWithTheme } from '../../src/helpers/testHelpers';

describe('ViewGL', () => {
  it('renders correctly', () => {
    const { getByTestId } = renderWithTheme(<ViewGL testID="view-gl" />);
    expect(getByTestId('view-gl')).toBeTruthy();
  });
});
