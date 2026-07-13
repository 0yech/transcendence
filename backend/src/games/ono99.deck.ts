import { Ono99Card } from './ono99.types';
import { seededShuffle } from './seeded-rng';

function card(
  type: Ono99Card['type'],
  value: number,
  label: string,
  index: number,
): Ono99Card {
  return {
    id: `${type}_${label}_${index}`,
    type,
    value,
    label,
  };
}

export function createOrderedOno99Deck(): Ono99Card[] {
  const deck: Ono99Card[] = [];

  for (let i = 0; i < 8; i++) {
    deck.push(card('NUMBER', 0, '0', i));
  }

  for (let value = 1; value <= 9; value++) {
    for (let i = 0; i < 6; i++) {
      deck.push(card('NUMBER', value, String(value), i));
    }
  }

  for (let i = 0; i < 10; i++) {
    deck.push(card('NUMBER', 10, '10', i));
  }

  for (let i = 0; i < 10; i++) {
    deck.push(card('ONO99', 99, 'ONO99', i));
  }

  for (let i = 0; i < 10; i++) {
    deck.push(card('REVERSE', 0, 'Reverse', i));
  }

  for (let i = 0; i < 10; i++) {
    deck.push(card('MINUS_TEN', -10, '-10', i));
  }

  for (let i = 0; i < 10; i++) {
    deck.push(card('PLAY_TWO', 0, 'Play2', i));
  }

  if (deck.length !== 112) {
    throw new Error(`Invalid deck size: ${deck.length}`);
  }

  return deck;
}

export function createSeededOno99Deck(seed: string): Ono99Card[] {
  return seededShuffle(createOrderedOno99Deck(), seed);
}

export function dealHands(deck: Ono99Card[], playerCount: number) {
  const drawPile = [...deck];
  const hands: Ono99Card[][] = Array.from({ length: playerCount }, () => []);

  for (let round = 0; round < 4; round++) {
    for (let seat = 0; seat < playerCount; seat++) {
      const next = drawPile.shift();

      if (!next) {
        throw new Error('Deck ran out while dealing');
      }

      hands[seat].push(next);
    }
  }

  return {
    drawPile,
    hands,
  };
}
