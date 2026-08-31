import { render } from '@testing-library/react-native';
import { PointerLabelUpdater } from '@gamelog/common/charts/PointerLabelUpdater';

describe('PointerLabelUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('calls onUpdate with the item when mounted', () => {
    const mockOnUpdate = jest.fn();
    const item = { dataPointText: 'Test' };

    render(<PointerLabelUpdater item={item} onUpdate={mockOnUpdate} />);

    // Fast-forward the setTimeout(..., 0)
    jest.runAllTimers();

    expect(mockOnUpdate).toHaveBeenCalledWith(item);
  });

  it('calls onUpdate with null when unmounted', () => {
    const mockOnUpdate = jest.fn();
    const item = { dataPointText: 'Test' };

    const { unmount } = render(<PointerLabelUpdater item={item} onUpdate={mockOnUpdate} />);

    jest.runAllTimers();
    mockOnUpdate.mockClear();

    unmount();

    // Fast-forward the setTimeout(..., 0) inside cleanup
    jest.runAllTimers();

    expect(mockOnUpdate).toHaveBeenCalledWith(null);
  });
});
