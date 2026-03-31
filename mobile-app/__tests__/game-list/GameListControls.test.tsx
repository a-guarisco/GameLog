import { render, fireEvent } from '@testing-library/react-native';
import { GameListControls } from '@gamelog/game-list/GameListControls';

describe('GameListControls Component', () => {
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with "name" sort option', () => {
    const { getByText } = render(
      <GameListControls sortBy="name" onSortChange={mockOnSortChange} />
    );

    expect(getByText('Sort by: name')).toBeTruthy();
  });

  it('renders correctly with "playtime" sort option', () => {
    const { getByText } = render(
      <GameListControls sortBy="playtime" onSortChange={mockOnSortChange} />
    );

    expect(getByText('Sort by: playtime')).toBeTruthy();
  });

  it('calls onSortChange with "playtime" when the current sortBy is "name"', () => {
    const { getByText } = render(
      <GameListControls sortBy="name" onSortChange={mockOnSortChange} />
    );

    const button = getByText('Sort by: name');
    fireEvent.press(button);

    expect(mockOnSortChange).toHaveBeenCalledWith('playtime');
  });

  it('calls onSortChange with "name" when the current sortBy is "playtime"', () => {
    const { getByText } = render(
      <GameListControls sortBy="playtime" onSortChange={mockOnSortChange} />
    );

    const button = getByText('Sort by: playtime');
    fireEvent.press(button);

    expect(mockOnSortChange).toHaveBeenCalledWith('name');
  });
});
