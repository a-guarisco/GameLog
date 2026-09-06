import { render, fireEvent } from '@testing-library/react-native';
import {
  AddFriendAction,
  IncomingRequestActions,
} from '@gamelog/social/user-card/FriendshipActions';
import { GluestackUIProvider } from '@gamelog/common/gluestack/gluestack-ui-provider';

describe('FriendshipActions', () => {
  const renderWithProvider = (component: React.ReactElement) =>
    render(<GluestackUIProvider mode="light">{component}</GluestackUIProvider>);

  it('handles AddFriendAction press and disabled state', () => {
    const onAddFriend = jest.fn();
    const { getByText, getByTestId } = renderWithProvider(
      <AddFriendAction userId="u1" onAddFriend={onAddFriend} isDisabled={false} />
    );

    expect(getByText('Add Friend')).toBeTruthy();
    fireEvent.press(getByTestId('add-friend-btn-u1'));
    expect(onAddFriend).toHaveBeenCalledWith('u1');
  });

  it('handles IncomingRequestActions accept and refuse clicks', () => {
    const onAccept = jest.fn();
    const onRefuse = jest.fn();

    const { getByText, getByTestId } = renderWithProvider(
      <IncomingRequestActions
        userId="u1"
        friendshipId="f1"
        onAccept={onAccept}
        onRefuse={onRefuse}
        isDisabled={false}
      />
    );

    expect(getByText('Accept')).toBeTruthy();
    expect(getByText('Refuse')).toBeTruthy();

    fireEvent.press(getByTestId('accept-btn-u1'));
    expect(onAccept).toHaveBeenCalledWith('f1');

    fireEvent.press(getByTestId('refuse-btn-u1'));
    expect(onRefuse).toHaveBeenCalledWith('f1');
  });
});
