import { Button, ButtonText } from '@gamelog/components/ui/button';
import { Box } from '@gamelog/components/ui/box';
import { SortBy } from './useGameList';

interface GameListControlsProps {
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

export const GameListControls = ({ sortBy, onSortChange }: GameListControlsProps) => (
  <Box className="p-4 gap-2">
    <Button onPress={() => onSortChange(sortBy === 'name' ? 'playtime' : 'name')}>
      <ButtonText>Sort by: {sortBy}</ButtonText>
    </Button>
  </Box>
);
