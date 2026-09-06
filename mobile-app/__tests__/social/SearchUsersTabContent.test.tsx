import { render, fireEvent } from '@testing-library/react-native';
import { SearchUsersTabContent } from '@gamelog/social/social-view/SearchUsersTabContent';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('SearchUsersTabContent', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  const mockUsers: any = [
    {
      user: { id: 'u1', username: 'Alex', steam_id: '76561198000000001' },
      friendship_id: null,
      status: 'NONE',
    },
  ];

  it('renders prompt when query is empty', () => {
    const { getByText } = renderWithProvider(
      <SearchUsersTabContent
        query=""
        onQueryChange={jest.fn()}
        results={[]}
        isLoading={false}
        error={false}
        handlers={{}}
      />
    );

    expect(getByText(/Type a username in the search bar above/)).toBeTruthy();
  });

  it('renders LoadingBox when searching', () => {
    const { getByText } = renderWithProvider(
      <SearchUsersTabContent
        query="alex"
        onQueryChange={jest.fn()}
        results={[]}
        isLoading={true}
        error={false}
        handlers={{}}
      />
    );

    expect(getByText('Searching users...')).toBeTruthy();
  });

  it('renders ErrorBox when error occurs', () => {
    const { getByText } = renderWithProvider(
      <SearchUsersTabContent
        query="alex"
        onQueryChange={jest.fn()}
        results={[]}
        isLoading={false}
        error={true}
        errorMessage="Search failed"
        handlers={{}}
      />
    );

    expect(getByText('Search failed')).toBeTruthy();
  });

  it('renders no results message when search returns empty array', () => {
    const { getByText } = renderWithProvider(
      <SearchUsersTabContent
        query="unknown_user"
        onQueryChange={jest.fn()}
        results={[]}
        isLoading={false}
        error={false}
        handlers={{}}
      />
    );

    expect(getByText('No users found matching "unknown_user".')).toBeTruthy();
  });

  it('renders search results and handles user input', () => {
    const onQueryChange = jest.fn();
    const onAddFriend = jest.fn();

    const { getByText, getByPlaceholderText } = renderWithProvider(
      <SearchUsersTabContent
        query="Alex"
        onQueryChange={onQueryChange}
        results={mockUsers}
        isLoading={false}
        error={false}
        handlers={{ onAddFriend }}
      />
    );

    expect(getByText('Search Results (1)')).toBeTruthy();
    expect(getByText('Alex')).toBeTruthy();

    const input = getByPlaceholderText('Search users by username...');
    fireEvent.changeText(input, 'Alex2');
    expect(onQueryChange).toHaveBeenCalledWith('Alex2');
  });
});
