import { render, screen } from '@testing-library/react-native';
import VSpace from '@gamelog/common/VSpace';

describe('VSpace', () => {
  it('renders with default height', () => {
    render(<VSpace testID="vspace-default" />);
    const el = screen.getByTestId('vspace-default');
    expect(el).toBeTruthy();
    expect(el.props.style).toEqual(expect.objectContaining({ height: 16 }));
  });

  it('renders with custom height', () => {
    render(<VSpace size={80} testID="vspace-custom" />);
    const el = screen.getByTestId('vspace-custom');
    expect(el).toBeTruthy();
    expect(el.props.style).toEqual(expect.objectContaining({ height: 80 }));
  });

  it('applies custom className', () => {
    render(<VSpace size={40} className="bg-red-500" testID="vspace-class" />);
    const el = screen.getByTestId('vspace-class');
    expect(el.props.className).toContain('bg-red-500');
  });
});
