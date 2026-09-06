export type GameListErrorCode =
  | 'gamelist/steam-api-key-missing'
  | 'gamelist/unauthorized'
  | 'gamelist/profile-private'
  | 'gamelist/user-not-found'
  | 'gamelist/network-error'
  | 'gamelist/server-error'
  | 'gamelist/unknown-error';

export const GAME_LIST_ERROR_MESSAGES: Record<GameListErrorCode, string> = {
  'gamelist/steam-api-key-missing':
    'Steam API key is not configured. Please add your Steam Web API Key in your profile settings.',
  'gamelist/unauthorized':
    'Unable to access Steam library. Your Steam API key may be invalid or unauthorized.',
  'gamelist/profile-private':
    'This Steam profile or game details are private. Please set your Steam game library to public.',
  'gamelist/user-not-found': 'Steam user ID not found. Please verify your Steam ID in settings.',
  'gamelist/network-error': 'Network connection error. Please check your internet connection.',
  'gamelist/server-error': 'Steam servers are currently unreachable. Please try again later.',
  'gamelist/unknown-error': 'Unable to load games. Please try again later.',
};

export const getGameListErrorMessage = (
  errorCode: GameListErrorCode | string | null | undefined
): string => {
  if (!errorCode) return '';
  return (
    GAME_LIST_ERROR_MESSAGES[errorCode as GameListErrorCode] ||
    'Unable to load games. Please try again later.'
  );
};

export const resolveGameListError = (
  rawError: unknown,
  hasApiKey: boolean = true
): { errorCode: GameListErrorCode; errorMessage: string } => {
  if (!hasApiKey) {
    const code: GameListErrorCode = 'gamelist/steam-api-key-missing';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  const rawMessage =
    rawError instanceof Error ? rawError.message : typeof rawError === 'string' ? rawError : '';

  if (rawMessage.includes('401') || (rawError as any)?.response?.status === 401) {
    const code: GameListErrorCode = 'gamelist/unauthorized';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  if (rawMessage.includes('403') || (rawError as any)?.response?.status === 403) {
    const code: GameListErrorCode = 'gamelist/profile-private';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  if (rawMessage.includes('404') || (rawError as any)?.response?.status === 404) {
    const code: GameListErrorCode = 'gamelist/user-not-found';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  if (
    rawMessage.includes('500') ||
    rawMessage.includes('502') ||
    rawMessage.includes('503') ||
    rawMessage.includes('504') ||
    ((rawError as any)?.response?.status && (rawError as any).response.status >= 500)
  ) {
    const code: GameListErrorCode = 'gamelist/server-error';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  if (
    rawMessage.toLowerCase().includes('network') ||
    rawMessage.includes('AbortError') ||
    rawMessage.includes('timed out') ||
    (rawError as any)?.code === 'ETIMEDOUT'
  ) {
    const code: GameListErrorCode = 'gamelist/network-error';
    return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
  }

  const code: GameListErrorCode = 'gamelist/unknown-error';
  return { errorCode: code, errorMessage: GAME_LIST_ERROR_MESSAGES[code] };
};
