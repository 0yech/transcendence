import { Game } from '~/components/game/Game';
import { NavBar } from '~/components/Navbar';

/**
 *
 * @brief use the context api that set the gameState every new state received. check if the user is well connected and is able to play
 * @brief use the index of each of the card in hand to play the desired slot.
 * @brief display the winners if any.
 * @brief display the last card played if any.
 *
 * @returns the function jsx needed to display the page with what's mentioned on top
 */
export default function PlayGame() {
  return (
    <>
      <NavBar className="fixed"></NavBar>
      <Game></Game>
    </>
  );
}
