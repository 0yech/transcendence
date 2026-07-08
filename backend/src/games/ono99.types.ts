export type Ono99CardType =
  'NUMBER' | 'MINUS_TEN' | 'REVERSE' | 'PLAY_TWO' | 'ONO99';

export type Ono99Card = {
  id: string;
  type: Ono99CardType;
  value: number;
  label: string;
};

export type GameWithPlayers = {
  id: string;
  lobbyId: string;
  status: string;
  seedPrivate: string;
  seedHash: string;
  total: number;
  direction: number;
  currentPlayerId: string | null;
  lastPlayedById: string | null;
  winnerId: string | null;
  pendingPlays: number;
  turnNumber: number;
  reshuffleIndex: number;
  deck: unknown;
  discardPile: unknown;
  players: Array<{
    id: string;
    gameId: string;
    userId: string;
    seat: number;
    status: string;
    hand: unknown;
    user?: {
      id: string;
      username: string;
      avatarUrl: string | null;
    };
  }>;
};
