import { contractValidator } from '../../contracts/contractValidator';
import type { CommunityGameStatusResponse, CommunityGenreHour } from '../../src/api-manager/dto/community';
import type { DailyReport } from '../../src/api-manager/dto/report';
import type { RecommendationResponse, UserSearchResult } from '../../src/api-manager/dto/userSocial';

describe('Cross-Boundary / OpenAPI Contract Validation Tests', () => {
  describe('Community Endpoint Contracts', () => {
    it('validates /community/game_statuses response payload against OpenAPI contract', () => {
      const mockGameStatusResponse: CommunityGameStatusResponse = {
        user: [
          { status: 'playing', count: 5, percentage: 50.0 },
          { status: 'platinato', count: 5, percentage: 50.0 },
        ],
        community: [
          { status: 'playing', count: 120, percentage: 60.0 },
          { status: 'shelved', count: 80, percentage: 40.0 },
        ],
        user_num_of_games: 10,
        community_num_of_games: 200,
      };

      const result = contractValidator.validateResponse({
        path: '/community/game_statuses',
        method: 'get',
        statusCode: 200,
        body: mockGameStatusResponse,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('validates /community/genre response payload against OpenAPI contract', () => {
      const mockGenreResponse: CommunityGenreHour[] = [
        { id: '1', description: 'Action', percentage: 45.5 },
        { id: '2', description: 'RPG', percentage: 54.5 },
      ];

      const result = contractValidator.validateResponse({
        path: '/community/genre',
        method: 'get',
        statusCode: 200,
        body: mockGenreResponse,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('validates /community/monthly_playtime response payload against OpenAPI contract', () => {
      const mockPlaytimeResponse = {
        user: [10, 20, 30, 40],
        community: [15, 25, 35, 45],
      };

      const result = contractValidator.validateResponse({
        path: '/community/monthly_playtime',
        method: 'get',
        statusCode: 200,
        body: mockPlaytimeResponse,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
  });

  describe('Games & Reports Endpoint Contracts', () => {
    it('validates /games/report response payload against OpenAPI contract', () => {
      const mockReportResponse: DailyReport = {
        date: '2026-09-05',
        game_reports: [
          {
            app_id: '730',
            today_play_time: 120,
            streak: 3,
            days_played_count: 14,
            max_playtime_per_day: 180,
          },
        ],
      };

      const result = contractValidator.validateResponse({
        path: '/games/report',
        method: 'get',
        statusCode: 200,
        body: mockReportResponse,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });

    it('validates /games/recommendations response payload against OpenAPI contract', () => {
      const mockRecommendationResponse: RecommendationResponse = {
        common_games: [
          {
            gameSteamId: '730',
            requester_play_time: 500,
            friend_play_time: 400,
          },
        ],
        common_genres: [
          {
            id: '1',
            description: 'Action',
          },
        ],
        top_games: [
          {
            gameSteamId: '1091500',
            keys: [{ id: '1', description: 'Action' }],
          },
        ],
      };

      const result = contractValidator.validateResponse({
        path: '/games/recommendations',
        method: 'get',
        statusCode: 200,
        body: mockRecommendationResponse,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
  });

  describe('Users & Social Endpoint Contracts', () => {
    it('validates /users/search response payload against OpenAPI contract', () => {
      const mockSearchResult: UserSearchResult[] = [
        {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            firebase_uid: 'firebase-uid-123',
            username: 'gamer_friend',
            steam_id: '76561198000000000',
            has_steam_api_key: true,
          },
          friendship: {
            friendship_id: '123e4567-e89b-12d3-a456-426614174001',
            friendship_status: 'accepted',
            friendship_requester_id: '123e4567-e89b-12d3-a456-426614174000',
            since: '2026-01-01T00:00:00',
          },
        },
      ];

      const result = contractValidator.validateResponse({
        path: '/users/search',
        method: 'get',
        statusCode: 200,
        body: mockSearchResult,
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toBeNull();
    });
  });

  describe('Contract Drift Detection (Negative / Failure Cases)', () => {
    it('detects and rejects schema drift when field names are renamed (e.g., camelCase vs snake_case)', () => {
      const driftedPayload = {
        user: [{ status: 'playing', count: 5, percentage: 50.0 }],
        community: [{ status: 'playing', count: 10, percentage: 50.0 }],
        // Intentionally drifted field name (userNumOfGames instead of user_num_of_games)
        userNumOfGames: 10,
        community_num_of_games: 20,
      };

      const result = contractValidator.validateResponse({
        path: '/community/game_statuses',
        method: 'get',
        statusCode: 200,
        body: driftedPayload,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorSummary).toContain("must have required property 'user_num_of_games'");
    });

    it('detects and rejects schema drift when field types mismatch (e.g., string instead of integer)', () => {
      const invalidTypePayload = {
        date: '2026-09-05',
        game_reports: [
          {
            app_id: '730',
            today_play_time: 'not-a-number', // Should be integer
            streak: 3,
            days_played_count: 14,
            max_playtime_per_day: 180,
          },
        ],
      };

      const result = contractValidator.validateResponse({
        path: '/games/report',
        method: 'get',
        statusCode: 200,
        body: invalidTypePayload,
      });

      expect(result.isValid).toBe(false);
      expect(result.errorSummary).toContain('must be integer');
    });
  });
});
