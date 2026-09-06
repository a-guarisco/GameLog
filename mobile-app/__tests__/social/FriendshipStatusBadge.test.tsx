import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FriendshipStatusBadge } from '@gamelog/social/user-card/FriendshipStatusBadge';
import { getFriendshipStatusStyle } from '@gamelog/social/user-card/friendshipStatus';

describe('FriendshipStatusBadge', () => {
  it('renders Friend label for accepted status', () => {
    render(<FriendshipStatusBadge status="accepted" testID="badge-accepted" />);
    expect(screen.getByTestId('badge-accepted')).toBeTruthy();
    expect(screen.getByText('Friend')).toBeTruthy();
  });

  it('renders Pending label for pending_incoming status', () => {
    render(<FriendshipStatusBadge status="pending_incoming" testID="badge-pending" />);
    expect(screen.getByTestId('badge-pending')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
  });

  it('renders Requested label for pending_outgoing status', () => {
    render(<FriendshipStatusBadge status="pending_outgoing" testID="badge-requested" />);
    expect(screen.getByTestId('badge-requested')).toBeTruthy();
    expect(screen.getByText('Requested')).toBeTruthy();
  });

  it('renders Blocked label for blocked status', () => {
    render(<FriendshipStatusBadge status="blocked" testID="badge-blocked" />);
    expect(screen.getByTestId('badge-blocked')).toBeTruthy();
    expect(screen.getByText('Blocked')).toBeTruthy();
  });

  it('renders Player label for null or unrecognized status', () => {
    render(<FriendshipStatusBadge status={null} testID="badge-player" />);
    expect(screen.getByTestId('badge-player')).toBeTruthy();
    expect(screen.getByText('Player')).toBeTruthy();
  });

  it('renders correctly when using legacy config prop', () => {
    render(<FriendshipStatusBadge config={{ label: 'Friend', tone: 'success' }} testID="badge-config" />);
    expect(screen.getByTestId('badge-config')).toBeTruthy();
    expect(screen.getByText('Friend')).toBeTruthy();
  });

  it('provides coherent styles from getFriendshipStatusStyle', () => {
    const friendStyle = getFriendshipStatusStyle('accepted');
    expect(friendStyle.label).toBe('Friend');
    expect(friendStyle.textClass).toContain('text-primary-500');

    const pendingStyle = getFriendshipStatusStyle('pending_incoming');
    expect(pendingStyle.label).toBe('Pending');
    expect(pendingStyle.textClass).toContain('text-warning-500');

    const blockedStyle = getFriendshipStatusStyle('blocked');
    expect(blockedStyle.label).toBe('Blocked');
    expect(blockedStyle.textClass).toContain('text-error-500');

    const defaultStyle = getFriendshipStatusStyle(undefined);
    expect(defaultStyle.label).toBe('Player');
    expect(defaultStyle.textClass).toContain('text-typography-300');
  });
});
