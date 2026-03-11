import { TextGL } from '../../src/common';
import { renderWithTheme } from '../../src/helpers/testHelpers';

describe('TextGL', () => {
  it('renders with default props', () => {
    const { getByText } = renderWithTheme(<TextGL>Hello</TextGL>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with size and variant props', () => {
    const { getByText } = renderWithTheme(
      <TextGL size="l" variant="bold">
        Big
      </TextGL>
    );
    expect(getByText('Big')).toBeTruthy();
  });
});
