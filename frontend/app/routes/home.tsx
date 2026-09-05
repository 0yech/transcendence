// import { Welcome } from '../pages/welcome';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { NavBar } from '~/components/Navbar';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { ButtonLinkIn } from '~/components/Button';
import { UseWebSocket } from '~/context/UseWebSocket';

export function HomeButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate('/');
      }}
    >
      Home
    </button>
  );
}

async function getFetch(apiPath: string) {
  const resp = await fetch(apiPath);
  if (!resp.ok) return null;
  const json = await resp.json();
  return json;
}

/**
 *
 * @brief create a useState for home page. loads it and pass it to Welcome component
 *
 */
export default function Home() {
  const { gameStarted, getCode, setUser, getUser } = UseWebSocket();
  const [userCurr, setUserCurr] = useState<SelfUserInterface | null>(null);
  useEffect(() => {
    async function fetchUser() {
      const data = await getFetch('/api/auth/me');
      if (data && data.username) {
        setUserCurr(data);
      }
    }
    fetchUser();
  }, []);
  if (userCurr) setUser(userCurr);
  console.log('user: ');
  console.log(getUser());
  return (
    <>
      <title>Transcendence</title>
      <NavBar className="fixed"></NavBar>
      <div className="h-dvh w-full bg-[url(/miku.png)] bg-size-[auto_150%] bg-no-repeat bg-position-[50%_-30%]">
        <div className="h-full w-full flex flex-col justify-end items-center bg-linear-to-t from-black via-dark-blue/0 to-dark-blue/0">
          {userCurr?.id ? (
            <div className="flex gap-6 mb-30">
              {/* <ButtonLinkIn className='text-5xl font-black p-6' to="/lobbies">Join Lobby</ButtonLinkIn> */}
              <ButtonLinkIn
                className="text-5xl font-black p-6"
                to={
                  userCurr.lobbyId
                    ? gameStarted()
                      ? `/game/${getCode()}/play`
                      : `/game/${getCode()}`
                    : '/lobbies'
                }
              >
                Play Now
              </ButtonLinkIn>
            </div>
          ) : (
            <div className="flex gap-6 mb-30">
              <ButtonLinkIn className="text-5xl font-black p-6" to="/login">
                Sign In
              </ButtonLinkIn>
              <ButtonLinkIn className="text-5xl font-black p-6" to="/register">
                Sign Up
              </ButtonLinkIn>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
