import { UseWebSocket } from '~/context/UseWebSocket';
import { useNavigate } from 'react-router';
import apiFetch from '~/utils/api-fetch';

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
  const { playSlot, gameState, userId, playFour, unable, disconnect } =
    UseWebSocket();
  const navigate = useNavigate();
  let myCards = null;
  console.log(gameState);
  console.log(userId());
  if (gameState) {
    const players = gameState.players.find(
      (element) => element.userId === userId(),
    );
    console.log(players);
    if (players) {
      myCards = players.hand;
      console.log(myCards);
    }
  }
  if (gameState?.winnerId && gameState?.status == 'FINISHED') {
    setTimeout(() => {
      apiFetch('/api/lobbies/leave', {
        method: 'POST',
      });
      disconnect();
      navigate('/');
    }, 10000);
  }
  return (
    <>
      <div className="w-full h-dvh flex flex-col justify-center items-center gap-4">
        <div className="w-fit h-fit flex flex-col gap-4">
          <li>
            <button
              className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
              onClick={() => navigate('/')}
            >
              home
            </button>
          </li>
          <li>pendingPlays: {gameState?.pendingPlays}</li>
          <li>turnNumber: {gameState?.turnNumber}</li>
          <li>DeckCount: {gameState?.deckCount}</li>
          <li>total: {gameState?.total}</li>
          <li>
            {gameState?.direction ? <>Left to right</> : <>Right to left</>}
          </li>
          {gameState && gameState.winnerId ? (
            <li>Winner: {gameState.winnerId}</li>
          ) : (
            <></>
          )}
          {gameState &&
          gameState.discardPile &&
          gameState.discardPile.length > 0 ? (
            <li>
              LastCardPlayed:{' '}
              {gameState.discardPile[gameState.discardPile.length - 1].id}
            </li>
          ) : (
            <></>
          )}

          {Array.isArray(myCards) ? (
            <>
              {myCards.map((card, index) => (
                <li key={card.id}>
                  <button
                    className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
                    onClick={() => playSlot(index + 1)}
                  >
                    play {index + 1} - {card.id}
                  </button>
                </li>
              ))}
              <li key="play99">
                <button
                  className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
                  onClick={() => playFour()}
                >
                  play Four ONO99
                </button>
              </li>
              <li key="forfeit">
                <button
                  className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
                  onClick={() => unable()}
                >
                  Unable to play
                </button>
              </li>
            </>
          ) : (
            <>not waa :(</>
          )}
        </div>
      </div>
    </>
  );
}
