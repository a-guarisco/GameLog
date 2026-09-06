import { render, fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { PlaytimeBlocksHeader } from '@gamelog/common/charts/playtime-blocks/PlaytimeBlocksHeader';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('PlaytimeBlocksHeader', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  const defaultProps = {
    isScrolling: false,
    shimmerAnim: new Animated.Value(0),
    displayTotalLabel: '120h total',
    displayPeakLabel: '5h on Fri',
    displayAvgLabel: '17h/day',
    trendRange: 'week',
    setWeekOffset: jest.fn(),
    baseLimitDate: '2026-08-01',
    summaryStartDate: 1725148800000,
    summaryEndDate: 1725753600000,
    weekOffset: 0,
    trendDays: [{ date: '2026-09-01' }],
  };

  it('renders summary labels and peak info when not scrolling', () => {
    const { getByText } = renderWithProvider(<PlaytimeBlocksHeader {...defaultProps} />);

    expect(getByText('120h total')).toBeTruthy();
    expect(getByText(/peak 5h on Fri · 17h\/day/)).toBeTruthy();
  });

  it('renders ShimmerBox when isScrolling is true', () => {
    const { queryByText } = renderWithProvider(
      <PlaytimeBlocksHeader {...defaultProps} isScrolling={true} />
    );

    expect(queryByText('120h total')).toBeNull();
  });

  it('handles week offset navigation correctly', () => {
    const setWeekOffset = jest.fn();
    const { getByTestId } = renderWithProvider(
      <PlaytimeBlocksHeader {...defaultProps} weekOffset={-1} setWeekOffset={setWeekOffset} />
    );

    const prevBtn = getByTestId('playtime-blocks-prev-week-btn');
    const nextBtn = getByTestId('playtime-blocks-next-week-btn');

    // Press left button
    fireEvent.press(prevBtn);
    expect(setWeekOffset).toHaveBeenCalled();

    // Call state updater passed to setWeekOffset
    const leftUpdater = setWeekOffset.mock.calls[0][0];
    expect(typeof leftUpdater === 'function' ? leftUpdater(-1) : null).toBe(-2);

    // Press right button
    fireEvent.press(nextBtn);
    const rightUpdater = setWeekOffset.mock.calls[1][0];
    expect(typeof rightUpdater === 'function' ? rightUpdater(-1) : null).toBe(0);
  });

  it('disables left button when trendDays first date reaches baseLimitDate', () => {
    const setWeekOffset = jest.fn();
    const { getByTestId } = renderWithProvider(
      <PlaytimeBlocksHeader
        {...defaultProps}
        baseLimitDate="2026-09-01"
        trendDays={[{ date: '2026-09-01' }]}
        setWeekOffset={setWeekOffset}
      />
    );

    const prevBtn = getByTestId('playtime-blocks-prev-week-btn');
    expect(prevBtn.props.accessibilityState?.disabled ?? prevBtn.props.disabled).toBe(true);
  });

  it('hides week navigation controls when trendRange is not week', () => {
    const { queryByTestId } = renderWithProvider(
      <PlaytimeBlocksHeader {...defaultProps} trendRange="month" displayPeakLabel={null} />
    );

    expect(queryByTestId('playtime-blocks-prev-week-btn')).toBeNull();
    expect(queryByTestId('playtime-blocks-next-week-btn')).toBeNull();
  });
});
