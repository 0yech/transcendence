import { ButtonNavLink } from './Button';
import { Avatar } from './Avatar';
import { twMerge } from 'tailwind-merge';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useState, useEffect } from 'react';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { LogoutButton } from '~/pages/auth/logout';

const baseStyle =
  'group flex justify-between items-center h-18 z-50 sticky w-full pr-2' as const;

const navStyles = {
  primary: 'bg-linear-to-b from-dark-blue to-dark-blue/0',
} as const;

type NavProps = {
  variant?: keyof typeof navStyles;
  className?: string;
};

export function NavBar({ className, variant = 'primary', ...rest }: NavProps) {
  const { gameStarted } = UseWebSocket();
  const [user, setUser] = useState<SelfUserInterface | null>(null);
  const [menuVisibility, setMenuVisibility] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((data) => data.json())
      .then((json) => setUser(json))
      .catch((e) => console.log(e));
  }, []);

  return (
    <nav
      className={twMerge(baseStyle, navStyles[variant], className)}
      {...rest}
    >
      <ul className="flex h-full m-0">
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
              {user.guild ? 'My Guild' : 'Create Guild'}
            </ButtonNavLink>
          </li>
        )}
        {user?.id &&
          user.lobbyId &&
          (gameStarted() ? (
            <li>
              <ButtonNavLink to={`/game/${user.lobbyId}/play`}>
                Current Game
              </ButtonNavLink>
            </li>
          ) : (
            <li>
              <ButtonNavLink to={`/game/${user.lobbyId}`}>
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
      <div>
        <Avatar
          className={twMerge(
            menuVisibility ? 'shadow-xl shadow-pink' : 'shadow-none',
            'h-12 w-12 transition-all duration-500 ease-in-out',
          )}
          onClick={() => {
            setMenuVisibility(!menuVisibility);
          }}
          src={user?.avatarUrl}
        ></Avatar>
        <ul
          className={twMerge(
            'bg-dark-blue/10 shadow-2xl shadow-dark-blue/30 rounded-2xl fixed top-0 right-0 mt-18 transition-all duration-500 ease-in-out',
            menuVisibility
              ? 'opacity-100 translate-y-0'
              : 'pointer-events-none opacity-0 -translate-y-3',
          )}
        >
          {user?.id ? (
            <li>
              <ButtonNavLink className="rounded-2xl" to="/profile">
                Profile
              </ButtonNavLink>
            </li>
          ) : (
            <li>
              <ButtonNavLink className="rounded-2xl" to="/register">
                Sign up
              </ButtonNavLink>
            </li>
          )}
          {user?.id ? (
            <li className="rounded-2xl flex justify-center">
              <LogoutButton />
            </li>
          ) : (
            <li>
              <ButtonNavLink className="rounded-2xl" to="/login">
                Sign in
              </ButtonNavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
