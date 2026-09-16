import { useTexture } from '@react-three/drei';

/**
 * The card textures, preloaded when the module loads so that no card pops in
 * on first display.
 */
function preloadCardImages() {
  useTexture.preload('/cards/censored.png');
  useTexture.preload('/cards/back.png');
  useTexture.preload('/cards/MINUS_TEN_-10.png');
  useTexture.preload('/cards/ONO99_ONO99.png');
  useTexture.preload('/cards/PLAY_TWO_Play2.png');
  useTexture.preload('/cards/REVERSE_Reverse.png');
  for (let i = 0; i <= 10; i++) useTexture.preload(`/cards/NUMBER_${i}.png`);
}

preloadCardImages();

/** A card's file name: "NUMBER_7_7" -> "NUMBER_7". */
export function cardName(card: { id: string } | undefined | null): string {
  if (!card || !card.id) return 'censored';
  return card.id.slice(0, card.id.lastIndexOf('_'));
}

/** Path to a card's texture, or to the hidden card if it is unknown. */
export function cardImage(card: { id: string } | undefined | null): string {
  return `/cards/${cardName(card)}.png`;
}
