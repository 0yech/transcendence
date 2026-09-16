import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * Client-side mirror of the backend's canPlayCard() (backend/src/games/ono99.rules.ts).
 * Only there to avoid starting an animation for a move the server will refuse:
 * the backend stays the sole authority on whether a move is legal.
 */
export function canPlayCard(
  card: InterfaceCardsGameState | undefined | null,
  total: number,
): boolean {
  if (!card) return false;

  if (card.type === 'ONO99') return false;

  if (card.type === 'NUMBER') return total + card.value < 99;

  return true;
}

/**
 * Mirror of the backend's hasFourOno99(). The service counts ONO99s without
 * checking the hand size, hence the >= 4 rather than an every().
 */
export function hasFourOno99(hand: InterfaceCardsGameState[]): boolean {
  return hand.filter((card) => card.type === 'ONO99').length >= 4;
}
