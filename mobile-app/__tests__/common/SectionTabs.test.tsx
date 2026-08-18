import { render, screen, fireEvent } from '@testing-library/react-native';
import SectionTabs, { SectionTab } from '@gamelog/common/SectionTabs';

type TabId = 'overview' | 'time' | 'genres';

const TABS: SectionTab<TabId>[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'time', label: 'Time' },
  { id: 'genres', label: 'Genres' },
];

const renderTabs = (activeId: TabId = 'overview', onChange = jest.fn()) => {
  render(
    <SectionTabs tabs={TABS} activeId={activeId} onChange={onChange} testIDPrefix="section-tab" />
  );
  return onChange;
};

describe('SectionTabs', () => {
  it('renders a tab for every entry', () => {
    renderTabs();

    TABS.forEach((tab) => expect(screen.getByText(tab.label)).toBeTruthy());
  });

  it('builds each testID from the prefix and the tab id', () => {
    renderTabs();

    expect(screen.getByTestId('section-tab-genres')).toBeTruthy();
  });

  it('reports the active tab to assistive technology', () => {
    renderTabs('time');

    expect(screen.getByTestId('section-tab-time').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true })
    );
    expect(screen.getByTestId('section-tab-genres').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false })
    );
  });

  it('emphasises the active label and mutes the rest', () => {
    renderTabs('time');

    expect(screen.getByText('Time').props.className).toContain('text-primary-300');
    expect(screen.getByText('Genres').props.className).toContain('text-typography-300');
  });

  it('calls onChange with the pressed tab id', () => {
    const onChange = renderTabs('overview');

    fireEvent.press(screen.getByTestId('section-tab-genres'));

    expect(onChange).toHaveBeenCalledWith('genres');
  });

  it('renders nothing when there are no tabs', () => {
    render(
      <SectionTabs tabs={[]} activeId={'overview' as TabId} onChange={jest.fn()} testIDPrefix="t" />
    );

    expect(screen.queryByTestId('t-overview')).toBeNull();
  });
});
