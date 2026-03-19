import { render } from '@testing-library/react-native';
import { TextGL } from '../../src/common';

describe('TextGL', () => {
  it('renders with default props', () => {
    const { getByText } = render(<TextGL>Hello</TextGL>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with variant, align and color props', () => {
    const { getByText } = render(
      <TextGL variant="h1" align="center" color="primary">
        Big
      </TextGL>
    );

    expect(getByText('Big')).toBeTruthy();
  });
});
