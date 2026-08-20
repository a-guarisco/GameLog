import { render, screen } from '@testing-library/react-native';
import { Text } from '@gamelog/common/gluestack/text';
import SectionCard from '@gamelog/common/SectionCard';

describe('SectionCard', () => {
  it('renders its children', () => {
    render(
      <SectionCard>
        <Text>War Thunder</Text>
      </SectionCard>
    );

    expect(screen.getByText('War Thunder')).toBeTruthy();
  });

  it('renders the label above the body', () => {
    render(
      <SectionCard label="Top games by hours">
        <Text>War Thunder</Text>
      </SectionCard>
    );

    expect(screen.getByText('Top games by hours')).toBeTruthy();
  });

  it('omits the label row when no label is given', () => {
    render(
      <SectionCard testID="card">
        <Text>War Thunder</Text>
      </SectionCard>
    );

    expect(screen.queryByText('Top games by hours')).toBeNull();
  });

  it('keeps the outlined block styling and appends caller classes', () => {
    render(
      <SectionCard className="mt-4" testID="card">
        <Text>War Thunder</Text>
      </SectionCard>
    );

    const { className } = screen.getByTestId('card').props;

    expect(className).toContain('border-outline-100');
    expect(className).toContain('bg-background-200');
    expect(className).toContain('mt-4');
  });
});
