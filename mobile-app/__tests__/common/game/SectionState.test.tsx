import { render, screen } from '@testing-library/react-native';
import SectionState, { SectionMessage, SectionSpinner } from '@gamelog/common/game/SectionState';

const messages = { errorMessage: 'Could not load news', emptyMessage: 'No news yet' };

describe('SectionState', () => {
  it('shows a spinner while loading, ahead of the other states', () => {
    render(<SectionState isLoading hasError isEmpty {...messages} />);

    expect(screen.UNSAFE_getByType(SectionSpinner)).toBeTruthy();
    expect(screen.queryByText('Could not load news')).toBeNull();
  });

  it('prefers the error message over the empty message', () => {
    render(<SectionState hasError isEmpty {...messages} />);

    expect(screen.getByText('Could not load news')).toBeTruthy();
    expect(screen.queryByText('No news yet')).toBeNull();
  });

  it('shows the empty message when there is nothing to list', () => {
    render(<SectionState isEmpty {...messages} />);

    expect(screen.getByText('No news yet')).toBeTruthy();
  });

  it('renders nothing once the section has content', () => {
    render(<SectionState {...messages} />);

    expect(screen.queryByText('No news yet')).toBeNull();
    expect(screen.queryByText('Could not load news')).toBeNull();
  });
});

describe('SectionMessage', () => {
  it('renders the text it is given', () => {
    render(<SectionMessage>No guides yet</SectionMessage>);

    expect(screen.getByText('No guides yet')).toBeTruthy();
  });
});
