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

  it('keeps the elevated card styling and appends caller classes', () => {
    render(
      <SectionCard className="mt-4" testID="card">
        <Text>War Thunder</Text>
      </SectionCard>
    );

    const { className } = screen.getByTestId('card').props;

    expect(className).toContain('shadow-sm');
    expect(className).toContain('bg-background-50');
    expect(className).toContain('mt-4');
  });

  it('renders headerRight alongside label with numberOfLines={2}', () => {
    render(
      <SectionCard
        label="DEADSKORPIOPROGAMERMC'S PLAYTIME"
        headerRight={<Text testID="header-right-action">1W / 6M</Text>}
      >
        <Text>Content</Text>
      </SectionCard>
    );

    const titleElement = screen.getByText("DEADSKORPIOPROGAMERMC'S PLAYTIME");
    expect(titleElement).toBeTruthy();
    expect(titleElement.props.numberOfLines).toBe(2);
    expect(screen.getByTestId('header-right-action')).toBeTruthy();
  });

  it('handles flex-1 className and passes style prop to Card', () => {
    render(
      <SectionCard className="flex-1" style={{ minHeight: 200 }} testID="card">
        <Text>Content</Text>
      </SectionCard>
    );

    const card = screen.getByTestId('card');
    expect(card.props.className).toContain('flex-1');
    expect(card.props.style).toEqual(expect.objectContaining({ minHeight: 200 }));
  });
});
