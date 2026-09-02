import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GenreFilter } from '@gamelog/game-list/filters/GenreFilter';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
);

describe('GenreFilter', () => {
  it('renders Genre chip with current selection', () => {
    const { getByText } = render(
      <GenreFilter genreFilter="All" setGenreFilter={jest.fn()} allAvailableGenres={['Action']} />,
      { wrapper }
    );
    expect(getByText('Genre', { exact: false })).toBeTruthy();
    expect(getByText('All')).toBeTruthy();
  });

  it('opens modal and calls setGenreFilter when an option is selected', () => {
    const setGenreFilter = jest.fn();
    const { getByText, queryByText } = render(
      <GenreFilter genreFilter="All" setGenreFilter={setGenreFilter} allAvailableGenres={['Action', 'RPG']} />,
      { wrapper }
    );
    
    expect(queryByText('Filter by Genre')).toBeNull();

    fireEvent.press(getByText('Genre', { exact: false }));
    expect(getByText('Filter by Genre')).toBeTruthy();

    fireEvent.press(getByText('RPG'));
    expect(setGenreFilter).toHaveBeenCalledWith('RPG');
  });
});
