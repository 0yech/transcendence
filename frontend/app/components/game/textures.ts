import { useTexture } from '@react-three/drei';

/**
 * Les textures des cartes, préchargées au chargement du module pour qu'aucune
 * carte ne "pope" au premier affichage.
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

/** Nom de fichier d'une carte : "NUMBER_7_7" -> "NUMBER_7". */
export function cardName(card: { id: string } | undefined | null): string {
  if (!card || !card.id) return 'censored';
  return card.id.slice(0, card.id.lastIndexOf('_'));
}

/** Chemin de la texture d'une carte, ou de la carte masquée si elle est inconnue. */
export function cardImage(card: { id: string } | undefined | null): string {
  return `/cards/${cardName(card)}.png`;
}
