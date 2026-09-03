import { createContext } from 'react';

/**
 *
 * @brief collection of Interfaces for easier understanding and easier access inside Component that useGameState
 *
 */
export interface InterfaceCardsGameState {
  id: string;
  type: string;
  label: string;
  value: number;
}

export interface InterfaceUserGameState {
  userId: string;
  username: string;
  avatarUrl: string | null;
  seat: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  status: string;
  handCount: 4;
  hand: InterfaceCardsGameState[] | number;
}

export interface InterfaceGameState {
  id: string;
  lobbyId: string;
  status: string;
  seedHash: string;
  total: number;
  direction: number;
  currentPlayerId: string;
  lastPlayedById: string;
  winnerId: string | null;
  pendingPlays: number;
  turnNumber: number;
  deckCount: number;
  discardPile: InterfaceCardsGameState[];
  players: InterfaceUserGameState[];
}

export interface SelfGame {
  id: string;
  status: string;
  winnerId: string | null;
  createdAt: string;
  startedAt: string;
  finishedAt: string;
}

interface SelfMatchHistory {
  id: string;
  eliminatedAt: string | null;
  eliminatedPosition: number | null;
  pointWon: number | null;
  game: SelfGame;
}

export interface SelfUserInterface {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  lobbyId: string | null;
  gamePlayers: SelfMatchHistory[];
  totalPts: 0;
  guildId: string | null;
  guildRole: 'LEADER' | 'OFFICER' | 'MEMBER' | null;
  guild: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

/**
 *
 * @brief Functions and gamestate. see WebSocketPrivider.tsx for more info
 *
 */
interface InterfaceWSConnection {
  connect: (code: string) => Promise<boolean>;
  disconnect: () => void;
  startGame: () => Promise<boolean>;
  playSlot: (slot: number) => Promise<boolean>;
  playFour: () => Promise<boolean>;
  unable: () => Promise<boolean>;
  isConnected: () => string | null;
  gameStarted: () => boolean;
  userId: () => string | null;
  setUserId: (id: string) => void;
  getUser: () => SelfUserInterface | null;
  getCode: () => string | null;
  gameState: InterfaceGameState | null;
}

export const WebsocketContext = createContext<InterfaceWSConnection | null>(
  null,
);
