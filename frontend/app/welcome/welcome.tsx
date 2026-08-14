import logoDark from './logo-dark.svg';
import logoLight from './logo-light.svg';
import Lobbies, { CreateNewLobby } from "../utils/lobbies"
import { useNavigate } from "react-router"

interface WelcomeProps {
    data: { username: string; avatarUrl: string };
}

export function Welcome({data}: WelcomeProps) {
  const isNotLoggedIn = data.username === "Login";
  const navigate = useNavigate()
  return (
    <>
      {isNotLoggedIn ? (
          <div>
            <button onClick={() => navigate("/login")}>Login here to see active lobby and play !</button>
          </div>
      ) : (
          <div>
            <button onClick={() => navigate("/profile")}>{data.username}</button>
            <CreateNewLobby />
            <Lobbies />
          </div>
      )}
    </>
  );
}