import {
  resolveGameListError,
  getGameListErrorMessage,
  GAME_LIST_ERROR_MESSAGES,
} from '../../src/game-list/gameListErrorMessages';

describe('gameListErrorMessages', () => {
  describe('getGameListErrorMessage', () => {
    it('returns empty string for null or empty code', () => {
      expect(getGameListErrorMessage(null)).toBe('');
      expect(getGameListErrorMessage(undefined)).toBe('');
      expect(getGameListErrorMessage('')).toBe('');
    });

    it('returns corresponding message for known error code', () => {
      expect(getGameListErrorMessage('gamelist/steam-api-key-missing')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/steam-api-key-missing']
      );
      expect(getGameListErrorMessage('gamelist/unauthorized')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/unauthorized']
      );
      expect(getGameListErrorMessage('gamelist/profile-private')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/profile-private']
      );
      expect(getGameListErrorMessage('gamelist/user-not-found')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/user-not-found']
      );
      expect(getGameListErrorMessage('gamelist/network-error')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/network-error']
      );
      expect(getGameListErrorMessage('gamelist/server-error')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/server-error']
      );
      expect(getGameListErrorMessage('gamelist/unknown-error')).toBe(
        GAME_LIST_ERROR_MESSAGES['gamelist/unknown-error']
      );
    });

    it('returns fallback message for unknown error code', () => {
      expect(getGameListErrorMessage('custom/unknown')).toBe(
        'Unable to load games. Please try again later.'
      );
    });
  });

  describe('resolveGameListError', () => {
    it('resolves steam-api-key-missing when hasApiKey is false', () => {
      const result = resolveGameListError(
        new Error('HTTP error: 401. url Called: https://api.steampowered.com/GetOwnedGames'),
        false
      );
      expect(result.errorCode).toBe('gamelist/steam-api-key-missing');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/steam-api-key-missing']);
      expect(result.errorMessage).not.toContain('url Called');
      expect(result.errorMessage).not.toContain('https://');
    });

    it('resolves unauthorized on HTTP 401 with api key present', () => {
      const result = resolveGameListError(
        new Error('HTTP error: 401. url Called: https://api.steampowered.com/GetOwnedGames'),
        true
      );
      expect(result.errorCode).toBe('gamelist/unauthorized');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/unauthorized']);
      expect(result.errorMessage).not.toContain('url Called');
    });

    it('resolves profile-private on HTTP 403', () => {
      const result = resolveGameListError(
        new Error('HTTP error: 403. url Called: https://api.steampowered.com/GetOwnedGames'),
        true
      );
      expect(result.errorCode).toBe('gamelist/profile-private');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/profile-private']);
    });

    it('resolves user-not-found on HTTP 404', () => {
      const result = resolveGameListError(
        new Error('HTTP error: 404. url Called: https://api.steampowered.com/GetOwnedGames'),
        true
      );
      expect(result.errorCode).toBe('gamelist/user-not-found');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/user-not-found']);
    });

    it('resolves server-error on HTTP 500/502/503', () => {
      const result = resolveGameListError(
        new Error('HTTP error: 500. url Called: https://api.steampowered.com/GetOwnedGames'),
        true
      );
      expect(result.errorCode).toBe('gamelist/server-error');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/server-error']);
    });

    it('resolves network-error on network failures or timeouts', () => {
      const result = resolveGameListError(new Error('Network request failed'), true);
      expect(result.errorCode).toBe('gamelist/network-error');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/network-error']);

      const timeoutResult = resolveGameListError(
        new Error('Request timed out after 8000ms. url Called: https://...'),
        true
      );
      expect(timeoutResult.errorCode).toBe('gamelist/network-error');
    });

    it('resolves unknown-error for arbitrary unexpected errors', () => {
      const result = resolveGameListError(new Error('Something weird'), true);
      expect(result.errorCode).toBe('gamelist/unknown-error');
      expect(result.errorMessage).toBe(GAME_LIST_ERROR_MESSAGES['gamelist/unknown-error']);
    });
  });
});
