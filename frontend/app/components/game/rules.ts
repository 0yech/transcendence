import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * Miroir côté client de canPlayCard() du backend (backend/src/games/ono99.rules.ts).
 * Sert uniquement à éviter de lancer une animation pour un coup que le serveur
 * refusera : le backend reste la seule autorité sur la légalité d'un coup.
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
 * Miroir de hasFourOno99() du backend. Le service compte les ONO99 sans vérifier
 * la taille de la main, d'où le >= 4 plutôt qu'un every().
 */
export function hasFourOno99(hand: InterfaceCardsGameState[]): boolean {
  return hand.filter((card) => card.type === 'ONO99').length >= 4;
}
