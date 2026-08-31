import { render, fireEvent, within } from '@testing-library/react-native';
import { ReportBox } from '../../src/report/ReportBox';
import { useReport } from '../../src/report/useReport';
import { useNavigation } from '@react-navigation/native';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';
import { config } from '@gamelog/common/gluestack/gluestack-ui-provider/config';

jest.mock('../../src/report/useReport');
jest.mock('../../src/report/useReportSortOrder', () => ({
  useReportSortOrder: jest.fn().mockReturnValue({
    sortOrder: 'playtime',
    setSortOrder: jest.fn(),
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockDateTimePicker(props: any) {
    return <View testID="mock-datetime-picker" {...props} />;
  };
});

describe('ReportBox', () => {
  const mockNavigate = jest.fn();
  const mockHandleFetchReport = jest.fn();
  const mockHandleClearDates = jest.fn();
  const mockSetStartDate = jest.fn();
  const mockSetEndDate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    (useReport as jest.Mock).mockReturnValue({
      startDate: undefined,
      setStartDate: mockSetStartDate,
      endDate: undefined,
      setEndDate: mockSetEndDate,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });
  });

  const renderComponent = () => {
    return render(
      <GluestackUIProvider mode="light">
        <ReportBox />
      </GluestackUIProvider>
    );
  };

  it('renders initial state correctly', () => {
    const { getByText, queryByText } = renderComponent();

    expect(getByText('Report Retrieval')).toBeTruthy();
    expect(getByText('From')).toBeTruthy();
    expect(getByText('To')).toBeTruthy();
    expect(getByText('Generates a report for the last 14 days.')).toBeTruthy();
    expect(queryByText('Reset')).toBeNull(); // Reset should not be visible when no dates
  });

  it('shows Clear button when a date is selected and calls handleClearDates on press', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date('2023-10-01'),
      endDate: undefined,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByText } = renderComponent();

    const clearButton = getByText('Reset');
    expect(clearButton).toBeTruthy();

    fireEvent.press(clearButton);
    expect(mockHandleClearDates).toHaveBeenCalled();
  });

  it('calls handleFetchReport when Generate Report is pressed', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date('2023-10-01'),
      endDate: undefined,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      isDefaultDates: false,
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByText } = renderComponent();

    // Click the Generate Report button
    fireEvent.press(getByText('Generate Report'));
    expect(mockHandleFetchReport).toHaveBeenCalled();
  });

  it('displays weeks text correctly when days is a multiple of 7', () => {
    // 7 days ago
    const start = new Date();
    start.setDate(start.getDate() - 7);

    (useReport as jest.Mock).mockReturnValue({
      startDate: start,
      endDate: undefined,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    let rendered = renderComponent();
    expect(rendered.getByText('Report starting 1 week ago.')).toBeTruthy();

    rendered.unmount();

    // 14 days ago
    const start2 = new Date();
    start2.setDate(start2.getDate() - 14);

    (useReport as jest.Mock).mockReturnValue({
      startDate: start2,
      endDate: undefined,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    rendered = renderComponent();
    expect(rendered.getByText('Report starting 2 weeks ago.')).toBeTruthy();
  });

  it('displays loading state correctly', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date('2023-10-01'),
      loading: true,
      error: null,
      report: null,
      gameNames: {},
      isDefaultDates: false,
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByText } = renderComponent();
    expect(getByText('Fetching report...')).toBeTruthy();
  });

  it('displays error state correctly', () => {
    (useReport as jest.Mock).mockReturnValue({
      loading: false,
      error: 'Test error message',
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByText } = renderComponent();
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('renders report with no games correctly', () => {
    (useReport as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      report: {
        date: '2023-10-10',
        game_reports: [],
      },
      gameNames: {},
      isDefaultDates: false,
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByText } = renderComponent();
    expect(getByText('No games played in this period.')).toBeTruthy();
  });

  it('renders report with games and navigates on game press', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-10'),
      appliedStartDate: new Date('2023-10-01'),
      appliedEndDate: new Date('2023-10-10'),
      loading: false,
      error: null,
      report: {
        date: '2023-10-10',
        game_reports: [
          { app_id: '123', today_play_time: 120, streak: 5 }, // 2h
          { app_id: '456', today_play_time: 45, streak: 10 }, // 45m
        ],
      },
      gameNames: {
        '123': 'Test Game',
        // 456 will fallback to App ID
      },
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const mockSetSortOrder = jest.fn();
    require('../../src/report/useReportSortOrder').useReportSortOrder.mockReturnValue({
      sortOrder: 'playtime',
      setSortOrder: mockSetSortOrder,
    });

    const { getByText, getAllByText } = renderComponent();

    // Check summary rendered correctly. The new UI uses selectReportSummary which returns:
    // "Oct 1 — Oct 10 · 10 days"
    // "2h" for PLAYTIME
    expect(getByText(/· 10 days/)).toBeTruthy();
    expect(getByText(/Playtime/i)).toBeTruthy();
    expect(getByText(/Games/i)).toBeTruthy();
    expect(getByText(/Top Game/i)).toBeTruthy();
    expect(getByText(/Max \/ Day/i)).toBeTruthy();

    // Top Game should be Test Game
    expect(getByText('Test Game')).toBeTruthy();
    // 45m should be formatted correctly

    // Click "See details" to expand the list
    fireEvent.press(getByText('Show game breakdown'));

    // Check formatting (2h appears in summary and list)
    expect(getAllByText('2h').length).toBeGreaterThan(0);
    expect(getByText('45m')).toBeTruthy();
    expect(getByText('App ID: 456')).toBeTruthy(); // Fallback name

    // Now there should be two "Test Game" elements: one in summary, one in the list
    const gameTexts = getAllByText('Test Game');
    fireEvent.press(gameTexts[gameTexts.length - 1]);

    expect(mockNavigate).toHaveBeenCalledWith('GameListTab', {
      screen: 'Game',
      params: {
        gameItem: {
          appid: '123',
          name: 'Test Game',
          playtime_forever: 120,
        },
      },
    });

    // Test sorting interactions
    fireEvent.press(getByText('Streak'));
    expect(mockSetSortOrder).toHaveBeenCalledWith('streak');

    fireEvent.press(getByText('A-Z'));
    expect(mockSetSortOrder).toHaveBeenCalledWith('alpha');
  });

  it('sorts the list based on sortOrder', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-10'),
      appliedStartDate: new Date('2023-10-01'),
      appliedEndDate: new Date('2023-10-10'),
      loading: false,
      error: null,
      report: {
        date: '2023-10-10',
        game_reports: [
          { app_id: '1', today_play_time: 10, streak: 10 },
          { app_id: '2', today_play_time: 20, streak: 5 },
        ],
      },
      gameNames: {
        '1': 'B Game',
        '2': 'A Game',
      },
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    // Mock Streak sorting
    require('../../src/report/useReportSortOrder').useReportSortOrder.mockReturnValue({
      sortOrder: 'streak',
      setSortOrder: jest.fn(),
    });

    let rendered = renderComponent();
    fireEvent.press(rendered.getByText('Show game breakdown'));

    // 10 streak is first
    let gameElements = rendered.getAllByTestId('game-list-item');
    expect(within(gameElements[0]).getByText('B Game')).toBeTruthy();

    rendered.unmount();

    // Mock Alpha sorting
    require('../../src/report/useReportSortOrder').useReportSortOrder.mockReturnValue({
      sortOrder: 'alpha',
      setSortOrder: jest.fn(),
    });

    rendered = renderComponent();
    fireEvent.press(rendered.getByText('Show game breakdown'));

    gameElements = rendered.getAllByTestId('game-list-item');
    expect(within(gameElements[0]).getByText('A Game')).toBeTruthy();
  });

  it('updates dates when DateTimePicker changes', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: undefined,
      setStartDate: mockSetStartDate,
      endDate: undefined,
      setEndDate: mockSetEndDate,
      loading: false,
      error: null,
      report: null,
      gameNames: {},
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getAllByText, UNSAFE_getAllByType } = renderComponent();

    // There are two "Select Date" buttons (From and To)
    const dateButtons = getAllByText('Select Date');
    fireEvent.press(dateButtons[0]); // First one is From
    fireEvent.press(dateButtons[1]); // Second one is To

    const pickers = UNSAFE_getAllByType(require('@react-native-community/datetimepicker'));
    expect(pickers.length).toBeGreaterThan(1);

    const newDate = new Date('2023-12-01');
    fireEvent(pickers[0], 'onChange', { type: 'set' }, newDate);
    expect(mockSetStartDate).toHaveBeenCalledWith(newDate);

    const newEndDate = new Date('2023-12-02');
    fireEvent(pickers[1], 'onChange', { type: 'set' }, newEndDate);
    expect(mockSetEndDate).toHaveBeenCalledWith(newEndDate);

    // Test undefined date (e.g. dismissed picker)
    fireEvent(pickers[0], 'onChange', { type: 'dismissed' }, undefined);
    expect(mockSetStartDate).toHaveBeenCalledTimes(1); // not called again

    fireEvent(pickers[1], 'onChange', { type: 'dismissed' }, undefined);
    expect(mockSetEndDate).toHaveBeenCalledTimes(1); // not called again
  });

  it('navigates to game details on press with missing game name and falsy playtime', () => {
    (useReport as jest.Mock).mockReturnValue({
      startDate: new Date(),
      endDate: new Date(),
      appliedStartDate: new Date(),
      appliedEndDate: new Date(),
      loading: false,
      error: null,
      report: {
        game_reports: [
          { app_id: '999', today_play_time: 0, streak: 1 }, // 0 playtime
        ],
      },
      gameNames: {}, // missing name
      handleFetchReport: mockHandleFetchReport,
      handleClearDates: mockHandleClearDates,
    });

    const { getByTestId, getByText } = renderComponent();

    // Show details first
    fireEvent.press(getByText('Show game breakdown'));

    fireEvent.press(getByTestId('game-list-item'));

    expect(mockNavigate).toHaveBeenCalledWith('GameListTab', {
      screen: 'Game',
      params: {
        gameItem: {
          appid: '999',
          name: 'App ID: 999',
          playtime_forever: 0,
        },
      },
    });
  });
});
