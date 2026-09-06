import {
  parseFriendshipDate,
  formatRelationshipSince,
} from '@gamelog/social/other-user-profile/OtherUserStats';

describe('OtherUserStats helpers', () => {
  describe('parseFriendshipDate', () => {
    it('returns null for empty string or null', () => {
      expect(parseFriendshipDate(null)).toBeNull();
      expect(parseFriendshipDate('')).toBeNull();
    });

    it('parses DD-MM-YYYY format correctly', () => {
      const date = parseFriendshipDate('15-08-2024');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2024);
      expect(date?.getMonth()).toBe(7); // 0-indexed: 7 = August
      expect(date?.getDate()).toBe(15);
    });

    it('parses ISO date format correctly', () => {
      const date = parseFriendshipDate('2024-03-07T12:00:00.000Z');
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2024);
    });
  });

  describe('formatRelationshipSince', () => {
    it('returns "Friend" with "Since <date>" for accepted friendships', () => {
      const res = formatRelationshipSince({
        friendship_status: 'accepted',
        since: '07-03-2024',
      });
      expect(res.label).toBe('Friend');
      expect(res.value).toContain('Since');
      expect(res.value).toContain('2024');
    });

    it('returns "Pending" with "Since <date>" for pending requests', () => {
      const res = formatRelationshipSince({
        friendship_status: 'pending_incoming',
        since: '12-05-2023',
      });
      expect(res.label).toBe('Pending');
      expect(res.value).toContain('Since');
      expect(res.value).toContain('2023');
    });

    it('returns "Blocked" with "Since <date>" for blocked relationships', () => {
      const res = formatRelationshipSince({
        friendship_status: 'blocked',
        since: '01-01-2022',
      });
      expect(res.label).toBe('Blocked');
      expect(res.value).toContain('Since');
      expect(res.value).toContain('2022');
    });

    it('returns "Status" with "—" when no relationship exists', () => {
      const res = formatRelationshipSince(null);
      expect(res.label).toBe('Status');
      expect(res.value).toBe('—');
    });
  });
});
