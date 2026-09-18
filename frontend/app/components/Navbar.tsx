import { ButtonNavLink } from './Button';
import { Avatar } from './Avatar';
import { twMerge } from 'tailwind-merge';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useState, useEffect } from 'react';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { LogoutButton } from '~/pages/auth/logout';
import apiFetch from '~/utils/api-fetch';

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
      <div className="relative">
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={menuVisibility}
          aria-controls="account-menu"
          className="rounded-full p-1 transition duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink/80"
          onClick={() => {
            setMenuVisibility(!menuVisibility);
          }}
        >
          <Avatar
            className={twMerge(
              menuVisibility
                ? 'ring-2 ring-pink shadow-xl shadow-pink/60'
                : 'ring-1 ring-light-pink/30 shadow-lg shadow-dark-blue/50',
              'h-12 w-12 transition-all duration-300 ease-out',
            )}
            src={user?.avatarUrl}
          />
        </button>
        <ul
          id="account-menu"
          className={twMerge(
            'absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-light-pink/25 bg-linear-to-br from-dark-blue/60 via-dark-blue/50 to-mid-dark-blue/45 p-1.5 shadow-xl shadow-dark-blue/50 backdrop-blur-md transition-all duration-300 ease-out',
            menuVisibility
              ? 'scale-100 opacity-100 translate-y-0'
              : 'pointer-events-none scale-95 opacity-0 -translate-y-2',
          )}
        >
          {user?.id ? (
            <>
              <li className="mb-1.5 flex items-center gap-2 border-b border-light-pink/20 px-2.5 pb-2.5 pt-1.5">
                <Avatar
                  className="h-8 w-8 ring-1 ring-light-pink/40"
                  src={user.avatarUrl}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-light-pink">
                    {user.username}
                  </p>
                  <p className="truncate text-[0.6rem] uppercase tracking-[0.16em] text-pink">
                    {user.guild?.name ?? 'No guild'}
                  </p>
                </div>
              </li>
              <li>
                <ButtonNavLink
                  className="h-auto min-w-0 justify-start rounded-xl px-3 py-2 text-sm font-bold text-light-pink hover:bg-pink/20"
                  to="/profile"
                >
                  Profile
                </ButtonNavLink>
              </li>
              <li>
                <ButtonNavLink
                  className="h-auto min-w-0 justify-start rounded-xl px-3 py-2 text-sm font-bold text-light-pink hover:bg-pink/20"
                  to="/settings"
                >
                  Settings
                </ButtonNavLink>
              </li>
              <li className="mt-1.5 border-t border-light-pink/20 pt-1.5">
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
              <li>
                <ButtonNavLink
                  className="h-auto min-w-0 justify-start rounded-xl px-3 py-2 text-sm font-bold text-light-pink hover:bg-pink/20"
                  to="/register"
                >
                  Sign up
                </ButtonNavLink>
              </li>
              <li>
                <ButtonNavLink
                  className="h-auto min-w-0 justify-start rounded-xl px-3 py-2 text-sm font-bold text-light-pink hover:bg-pink/20"
                  to="/login"
                >
                  Sign in
                </ButtonNavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
