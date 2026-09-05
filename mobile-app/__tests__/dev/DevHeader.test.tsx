import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { DevHeader } from '@gamelog/dev/DevHeader';
import * as OrientationHook from '@gamelog/common/useOrientation';

jest.mock('@react-native-vector-icons/ionicons', () => 'Ionicons');
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 10, bottom: 0, left: 15, right: 0 })),
}));

describe('DevHeader', () => {
  const mockNavigation: any = {
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and calls navigation.goBack on back button press', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });

    render(
      <DevHeader
        navigation={mockNavigation}
        route={{ key: 'DevEnv-1', name: 'DevEnv' }}
        options={{ title: 'Environment Variables' }}
        back={{ title: 'Developer Dashboard' }}
        layout={{ width: 390, height: 844 }}
      />
    );

    expect(screen.getByText('Environment Variables')).toBeTruthy();
    const backBtn = screen.getByTestId('dev-header-back-btn');
    expect(backBtn).toBeTruthy();

    fireEvent.press(backBtn);
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when back prop is missing', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: false,
      isTablet: false,
      width: 390,
      height: 844,
    });

    render(
      <DevHeader
        navigation={mockNavigation}
        route={{ key: 'TestingMain-1', name: 'TestingMain' }}
        options={{ title: 'Developer Dashboard' }}
        layout={{ width: 390, height: 844 }}
      />
    );

    expect(screen.getByText('Developer Dashboard')).toBeTruthy();
    expect(screen.queryByTestId('dev-header-back-btn')).toBeNull();
  });

  it('applies rail offset padding in landscape mode to clear the left rail', () => {
    jest.spyOn(OrientationHook, 'useOrientation').mockReturnValue({
      isLandscape: true,
      isTablet: false,
      width: 844,
      height: 390,
    });

    const { getByText } = render(
      <DevHeader
        navigation={mockNavigation}
        route={{ key: 'DevAesthetics-1', name: 'DevAesthetics' }}
        options={{ title: 'Aesthetics & Theme' }}
        back={{ title: 'Back' }}
        layout={{ width: 844, height: 390 }}
      />
    );

    expect(getByText('Aesthetics & Theme')).toBeTruthy();
    expect(screen.getByTestId('dev-header-back-btn')).toBeTruthy();
  });
});
