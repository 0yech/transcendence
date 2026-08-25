import Lobbies, { CreateNewLobby } from '../utils/lobbies';
import { useNavigate } from 'react-router';

interface WelcomeProps {
  data: { username: string; avatarUrl: string };
}

/**
 *
 * @brief root page "/". display lobbies, or invite the user to login/register if not logged-in
 *
 * @param data being user's information (username)
 * @param data.username user's username avatarUrl
 * @param data.avatarUrl user's avatarUrl
 *
 * @returns -> check @briefs
 */
export function Welcome({ data }: WelcomeProps) {
  const isNotLoggedIn = data.username === 'Login';
  const navigate = useNavigate();
  return (
    <>
      {isNotLoggedIn ? (
        <div>
          <button onClick={() => navigate('/login')}>
            Login here to see active lobby and play !
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => navigate('/profile')}>Profile: {data.username}</button>
          <CreateNewLobby />
          <Lobbies />
        </div>
      )}
    </>
  );
}
