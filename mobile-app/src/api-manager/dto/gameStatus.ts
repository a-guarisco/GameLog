export type GameStatus = 'shelved' | 'to_be_played' | 'playing' | 'played' | 'platinato';

export interface GameStatusesResponse {
  app_id: string;
  status: GameStatus;
}


export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  playing: 'Playing',
  to_be_played: 'To Be Played',
  shelved: 'Shelved',
  played: 'Played',
  platinato: 'Platinato',
};

export const formatGameStatus = (status?: string | null): string => {
  if (!status) return 'None';
  return GAME_STATUS_LABELS[status as GameStatus] || status;
};
