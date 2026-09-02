import { render, fireEvent } from '@testing-library/react-native';
import ReportRetrievalCard from '@gamelog/report/ReportRetrievalCard';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('ReportRetrievalCard', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  const yesterday = new Date('2026-08-31');

  it('renders default info when no dates are set', () => {
    const handleFetchReport = jest.fn();
    const handleClearDates = jest.fn();
    const setShowStart = jest.fn();
    const setShowEnd = jest.fn();

    const { getByText } = renderWithProvider(
      <ReportRetrievalCard
        startDate={undefined}
        endDate={undefined}
        yesterday={yesterday}
        loading={false}
        error={null}
        showStart={false}
        showEnd={false}
        setShowStart={setShowStart}
        setShowEnd={setShowEnd}
        onStartChange={jest.fn()}
        onEndChange={jest.fn()}
        handleFetchReport={handleFetchReport}
        handleClearDates={handleClearDates}
        formatDate={(d) => d?.toISOString() ?? ''}
        hasReport={false}
      />
    );

    expect(getByText('Generates a report for the last 14 days.')).toBeTruthy();
    expect(getByText('Generate Report')).toBeTruthy();

    fireEvent.press(getByText('Generate Report'));
    expect(handleFetchReport).toHaveBeenCalled();
  });

  it('renders dynamic text for single date starting 1 week ago and handles reset button', () => {
    const startDate = new Date('2026-08-25'); // 7 days from 2026-08-31
    const handleClearDates = jest.fn();

    const { getByText } = renderWithProvider(
      <ReportRetrievalCard
        startDate={startDate}
        endDate={undefined}
        yesterday={yesterday}
        loading={false}
        error={null}
        showStart={false}
        showEnd={false}
        setShowStart={jest.fn()}
        setShowEnd={jest.fn()}
        onStartChange={jest.fn()}
        onEndChange={jest.fn()}
        handleFetchReport={jest.fn()}
        handleClearDates={handleClearDates}
        formatDate={(d) => '2026-08-25'}
        hasReport={true}
      />
    );

    expect(getByText('Reset')).toBeTruthy();
    expect(getByText(/Report starting/)).toBeTruthy();

    fireEvent.press(getByText('Reset'));
    expect(handleClearDates).toHaveBeenCalled();
  });

  it('renders duration when both startDate and endDate are set and shows DateTimePickers', () => {
    const startDate = new Date('2026-08-01');
    const endDate = new Date('2026-08-10');
    const onStartChange = jest.fn();
    const onEndChange = jest.fn();

    const { getByText } = renderWithProvider(
      <ReportRetrievalCard
        startDate={startDate}
        endDate={endDate}
        yesterday={yesterday}
        loading={true}
        error="Sample error message"
        showStart={true}
        showEnd={true}
        setShowStart={jest.fn()}
        setShowEnd={jest.fn()}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        handleFetchReport={jest.fn()}
        handleClearDates={jest.fn()}
        formatDate={(d) => d?.toISOString().split('T')[0] ?? ''}
        hasReport={true}
      />
    );

    expect(getByText('Duration: 10 days.')).toBeTruthy();
    expect(getByText('Fetching report...')).toBeTruthy();
    expect(getByText('Sample error message')).toBeTruthy();
  });
});
