import { render, screen } from '@testing-library/react-native';
import { Text } from '@gamelog/common/gluestack/text';
import Chip from '@gamelog/common/Chip';

describe('Chip', () => {
  it('renders its children', () => {
    render(
      <Chip>
        <Text>11,392 playing now</Text>
      </Chip>
    );

    expect(screen.getByText('11,392 playing now')).toBeTruthy();
  });

  it('uses the rounded pill shape by default', () => {
    render(
      <Chip testID="chip">
        <Text>0 day streak</Text>
      </Chip>
    );

    expect(screen.getByTestId('chip').props.className).toContain('rounded-full');
  });

  it('uses the compact squared shape for tags', () => {
    render(
      <Chip variant="tag" testID="chip">
        <Text>Walkthrough</Text>
      </Chip>
    );

    const { className } = screen.getByTestId('chip').props;

    expect(className).toContain('rounded-md');
    expect(className).not.toContain('rounded-full');
  });

  it('keeps the caller colours', () => {
    render(
      <Chip className="border-primary-500 bg-primary-500" testID="chip">
        <Text>Live</Text>
      </Chip>
    );

    expect(screen.getByTestId('chip').props.className).toContain('bg-primary-500');
  });
});
