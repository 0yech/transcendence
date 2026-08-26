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
  hand: Array<InterfaceCardsGameState> | number;
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
  discardPile: Array<InterfaceCardsGameState>;
  players: Array<InterfaceUserGameState>;
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
  isConnected: () => string | null;
  gameStarted: () => boolean;
  myId: () => string | null;
  gameState: InterfaceGameState | null;
}

export const WebsocketContext = createContext<InterfaceWSConnection | null>(
  null,
);
