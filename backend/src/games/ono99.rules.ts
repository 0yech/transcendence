import { Ono99Card } from './ono99.types';
import { seededShuffle } from './seeded-rng';

export function canPlayCard(card: Ono99Card, total: number): boolean {
  if (card.type === 'ONO99') {
    return false;
  }

  if (card.type === 'NUMBER') {
    return total + card.value < 99;
  }

  return true;
}

export function hasPlayableCard(hand: Ono99Card[], total: number): boolean {
  return hand.some((card) => canPlayCard(card, total));
}

export function hasFourOno99(hand: Ono99Card[]): boolean {
  return hand.filter((card) => card.type === 'ONO99').length >= 4;
}

export function applyCardToTotal(card: Ono99Card, total: number): number {
  if (card.type === 'NUMBER') {
    return total + card.value;
  }

  if (card.type === 'MINUS_TEN') {
    return Math.max(0, total - 10);
  }

  return total;
}

export function removeCardFromHand(hand: Ono99Card[], cardId: string) {
  const index = hand.findIndex((card) => card.id === cardId);

  if (index === -1) {
    throw new Error('Card not found in hand');
  }

  const copy = [...hand];
  const [card] = copy.splice(index, 1);

  return {
    card,
    hand: copy,
  };
}

export function removeFourOno99(hand: Ono99Card[]) {
  const removed: Ono99Card[] = [];
  const remaining: Ono99Card[] = [];

  for (const card of hand) {
    if (card.type === 'ONO99' && removed.length < 4) {
      removed.push(card);
    } else {
      remaining.push(card);
    }
  }

  if (removed.length !== 4) {
    throw new Error('Need four ONO99 cards');
  }

  return {
    removed,
    hand: remaining,
  };
}

export function drawUntilFour(params: {
  hand: Ono99Card[];
  deck: Ono99Card[];
  discardPile: Ono99Card[];
  privateSeed: string;
  reshuffleIndex: number;
}) {
  let hand = [...params.hand];
  let deck = [...params.deck];
  let discardPile = [...params.discardPile];
  let reshuffleIndex = params.reshuffleIndex;

  while (hand.length < 4) {
    if (deck.length === 0) {
      deck = seededShuffle(
        discardPile,
        `${params.privateSeed}:reshuffle:${reshuffleIndex}`,
      );

      discardPile = [];
      reshuffleIndex += 1;
    }

    const drawn = deck.shift();

    if (!drawn) {
      break;
    }

    hand.push(drawn);
  }

  return {
    hand,
    deck,
    discardPile,
    reshuffleIndex,
  };
}
