import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StatusFilter } from '@gamelog/game-list/filters/StatusFilter';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('StatusFilter', () => {
  it('renders Status chip with current selection', () => {
    const { getByText } = render(
      <StatusFilter statusFilter="All" setStatusFilter={jest.fn()} />,
      { wrapper }
    );
    expect(getByText('Status', { exact: false })).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('renders correctly when specific status or none is selected', () => {
    const { getByText, rerender } = render(
      <StatusFilter statusFilter="playing" setStatusFilter={jest.fn()} />,
      { wrapper }
    );
    expect(getByText('Playing')).toBeTruthy();

    rerender(
      <GluestackUIProvider mode="light">
        <StatusFilter statusFilter="to_be_played" setStatusFilter={jest.fn()} />
      </GluestackUIProvider>
    );
    expect(getByText('To Be Played')).toBeTruthy();

    rerender(
      <GluestackUIProvider mode="light">
        <StatusFilter statusFilter="none" setStatusFilter={jest.fn()} />
      </GluestackUIProvider>
    );
    expect(getByText('No Status')).toBeTruthy();
  });

  it('opens modal and calls setStatusFilter when an option is selected', () => {
    const setStatusFilter = jest.fn();
    const { getByText, queryByText } = render(
      <StatusFilter statusFilter="All" setStatusFilter={setStatusFilter} />,
      { wrapper }
    );

    expect(queryByText('Filter by Status')).toBeNull();

    fireEvent.press(getByText('Status', { exact: false }));
    expect(getByText('Filter by Status')).toBeTruthy();
    expect(getByText('All Statuses')).toBeTruthy();
    expect(getByText('Playing')).toBeTruthy();
    expect(getByText('To Be Played')).toBeTruthy();
    expect(getByText('Shelved')).toBeTruthy();
    expect(getByText('Platinato')).toBeTruthy();
    expect(getByText('No Status')).toBeTruthy();

    fireEvent.press(getByText('To Be Played'));
    expect(setStatusFilter).toHaveBeenCalledWith('to_be_played');
  });

  it('can close the modal via close request', () => {
    const { getByText, queryByText, UNSAFE_getByType } = render(
      <StatusFilter statusFilter="All" setStatusFilter={jest.fn()} />,
      { wrapper }
    );

    fireEvent.press(getByText('Status', { exact: false }));
    expect(getByText('Filter by Status')).toBeTruthy();

    const { Modal } = require('react-native');
    const modal = UNSAFE_getByType(Modal);
    fireEvent(modal, 'requestClose');
    expect(queryByText('Filter by Status')).toBeNull();
  });
});
