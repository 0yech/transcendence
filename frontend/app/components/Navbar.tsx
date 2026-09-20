import { ButtonNavLink } from './Button';
import { Avatar } from './Avatar';
import { twMerge } from 'tailwind-merge';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useState, useEffect } from 'react';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { LogoutButton } from '~/pages/auth/logout';
import apiFetch from '~/utils/api-fetch';

const baseStyle =
  'group flex lg:justify-between justify-end items-center h-fit lg:h-20 z-50 sticky w-full' as const;

const navStyles = {
  primary: 'text-black lg:text-white',
} as const;

type NavProps = {
  variant?: keyof typeof navStyles;
  className?: string;
};

export function NavBar({ className, variant = 'primary', ...rest }: NavProps) {
  const { gameStarted, getCode } = UseWebSocket();
  const lobbyCode = getCode();
  const [user, setUser] = useState<SelfUserInterface | null>(null);
  const [menuVisibility, setMenuVisibility] = useState<boolean>(false);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then((data) => data.json())
      .then((json) => setUser(json))
      .catch((e) => console.log(e));
  }, []);

  return (
    <nav
      className={twMerge(
        baseStyle,
        navStyles[variant],
        menuVisibility ? 'bg-white lg:bg-white/0' : '',
        className,
      )}
      {...rest}
    >
      <ul
        className={`flex lg:flex-row gap-0 lg:gap-2 items-center flex-col h-full lg:w-fit w-full m-0 transition-all duration-300 ${!menuVisibility && 'hidden lg:flex'}`}
      >
        <li className="flex justify-end w-full">
          <button
            type="button"
            aria-label="Close navbar menu"
            className="pr-2 mt-1 lg:hidden text-end w-full font-black text-2xl transition-all duration-300 hover:text-shadow-lg hover:text-shadow-light-pink"
            onClick={() => {
              setMenuVisibility(!menuVisibility);
            }}
          >
            X
          </button>
        </li>
        <li>
          <ButtonNavLink to="/">Home</ButtonNavLink>
        </li>
        <li>
          <ButtonNavLink to="/guilds" end>
            Guilds
          </ButtonNavLink>
        </li>
        {user?.id && (
          <li>
            <ButtonNavLink to="/guilds/me" end>
              My Guild
            </ButtonNavLink>
          </li>
        )}
        {user?.id && (
          <li>
            <ButtonNavLink to="/friends" end>
              Friends
            </ButtonNavLink>
          </li>
        )}
        {user?.id &&
          user.lobbyId &&
          lobbyCode &&
          (gameStarted() ? (
            <li>
              <ButtonNavLink to={`/game/${lobbyCode}/play`}>
                Current Game
              </ButtonNavLink>
            </li>
          ) : (
            <li>
              <ButtonNavLink to={`/game/${lobbyCode}`}>
                Current Lobby
              </ButtonNavLink>
            </li>
          ))}
        {user?.id && (
          <li>
            <ButtonNavLink to="/lobbies">Lobbies</ButtonNavLink>
          </li>
        )}
      </ul>
      <div className="lg:relative block">
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={menuVisibility}
          aria-controls="account-menu"
          className="rounded-full transition duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-pink/80"
          onClick={() => {
            setMenuVisibility(!menuVisibility);
          }}
        >
          <Avatar
            className={twMerge(
              menuVisibility
                ? 'lg:ring-2 lg:ring-pink lg:shadow-xl lg:shadow-pink/60 hidden lg:block'
                : 'shadow-lg',
              'h-12 w-12 mr-4 mt-4 lg:mt-0 transition-all duration-300 ease-out',
            )}
            src={user?.avatarUrl}
          />
        </button>
        <ul
          id="account-menu"
          className={twMerge(
            'absolute right-0 top-full lg:mt-2 lg:w-48 w-full overflow-hidden lg:rounded-2xl lg:p-1.5 pb-5 bg-white lg:bg-white/10 text-black lg:text-white transition-all duration-300 ease-out',
            menuVisibility
              ? 'scale-100 opacity-100 translate-y-0'
              : 'pointer-events-none scale-95 opacity-0 -translate-y-2',
          )}
        >
          {user?.id ? (
            <>
              <li>
                <ButtonNavLink to="/profile">Profile</ButtonNavLink>
              </li>
              <li>
                <ButtonNavLink to="/settings">Settings</ButtonNavLink>
              </li>
              <li>
                <LogoutButton className="text-light-pink w-full font-bold text-xl text-center transition-all duration-300 ease-out hover:text-danger hover:text-shadow-md hover:text-shadow-light-pink" />
              </li>
            </>
          ) : (
            <>
              <li>
                <ButtonNavLink to="/register">Sign up</ButtonNavLink>
              </li>
              <li>
                <ButtonNavLink to="/login">Sign in</ButtonNavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
