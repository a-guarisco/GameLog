import { renderHook } from '@testing-library/react-native';
import {
  useCommunityGameStatusData,
  formatCommunityGameCount,
} from '@gamelog/common/charts/community-game-status/useCommunityGameStatusData';
import type { CommunityGameStatusResponse } from '@gamelog/api-manager/dto';

describe('useCommunityGameStatusData', () => {
  describe('formatCommunityGameCount', () => {
    it('formats 0 or falsy properly', () => {
      expect(formatCommunityGameCount(0)).toBe('0');
      expect(formatCommunityGameCount(null)).toBe('0');
      expect(formatCommunityGameCount(undefined)).toBe('0');
    });

    it('formats integer values as integers', () => {
      expect(formatCommunityGameCount(45)).toBe('45');
      expect(formatCommunityGameCount(45.0)).toBe('45');
    });

    it('formats values under 10 with 1 decimal place', () => {
      expect(formatCommunityGameCount(1.8)).toBe('1.8');
      expect(formatCommunityGameCount(3.25)).toBe('3.3');
    });

    it('rounds values 10 or greater to nearest integer', () => {
      expect(formatCommunityGameCount(45.2)).toBe('45');
      expect(formatCommunityGameCount(45.8)).toBe('46');
    });
  });

  describe('useCommunityGameStatusData hook', () => {
    it('handles empty / undefined data gracefully', () => {
      const { result } = renderHook(() => useCommunityGameStatusData({ data: null }));

      expect(result.current.hasData).toBe(false);
      expect(result.current.userTotalGames).toBe(0);
      expect(result.current.communityTotalGamesFormatted).toBe('0');
      expect(result.current.comparisonItems).toEqual([]);
      expect(result.current.userPieData.length).toBe(1);
      expect(result.current.userPieData[0].label).toBe('Empty');
    });

    it('maps user and community status items into ordered comparison items and pie data', () => {
      const mockData: CommunityGameStatusResponse = {
        user: [
          { status: 'shelved', count: 0, percentage: 0 },
          { status: 'to_be_played', count: 17, percentage: 32.69 },
          { status: 'playing', count: 35, percentage: 67.31 },
          { status: 'platinato', count: 0, percentage: 0 },
        ],
        community: [
          { status: 'shelved', count: 0.2, percentage: 11.11 },
          { status: 'to_be_played', count: 0, percentage: 0 },
          { status: 'playing', count: 1.6, percentage: 88.89 },
          { status: 'platinato', count: 0, percentage: 0 },
        ],
        user_num_of_games: 52,
        community_num_of_games: 1.8,
      };

      const { result } = renderHook(() => useCommunityGameStatusData({ data: mockData }));

      expect(result.current.hasData).toBe(true);
      expect(result.current.userTotalGames).toBe(52);
      expect(result.current.communityTotalGamesFormatted).toBe('1.8');

      // Order should be: playing, to_be_played, shelved, platinato
      const statuses = result.current.comparisonItems.map((i) => i.status);
      expect(statuses).toEqual(['playing', 'to_be_played', 'shelved', 'platinato']);

      expect(result.current.comparisonItems[0]).toEqual(
        expect.objectContaining({
          status: 'playing',
          userPercentage: 67.31,
          communityPercentage: 88.89,
        })
      );

      // Pie data should only include slices with value > 0
      expect(result.current.userPieData.map((p) => p.status)).toEqual(['playing', 'to_be_played']);
      expect(result.current.communityPieData.map((p) => p.status)).toEqual(['playing', 'shelved']);
    });
  });
});
