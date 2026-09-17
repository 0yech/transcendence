import { useEffect, useState, type ReactNode } from 'react';
import { useFetchers, useNavigation } from 'react-router';
import { io } from 'socket.io-client';
import { getCurrentUser } from '~/utils/users';
import { PresenceContext } from './PresenceContext';

/**
 * The online friends of one user, tagged with who they belong to, so a
 * previous account's friends are never shown after switching accounts.
 */
interface PresenceState {
  userId: string;
  onlineUsers: Set<string>;
}

/**
 * @brief Keeps a /presence socket open while someone is logged in, and
 * publishes which of their friends are online.
 *
 * Logging in and out happen through form submissions (the login form, the
 * logout button, removing an account) without reloading the page, so the
 * logged-in user is checked again every time a submission finishes. The
 * socket lives in an effect that depends on that user: logging in opens it,
 * logging out closes it, and switching accounts replaces it.
 *
 * @param children The part of the app that can read presence.
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const [userId, setUserId] = useState<string | null>(null);
  const [presence, setPresence] = useState<PresenceState | null>(null);

  const isSubmitting =
    navigation.state === 'submitting' ||
    fetchers.some((fetcher) => fetcher.state === 'submitting');

  // Check who is logged in when the app loads, and after every submission.
  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    let cancelled = false;

    getCurrentUser().then((user) => {
      if (!cancelled) {
        setUserId(user?.id ?? null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isSubmitting]);

  useEffect(() => {
    if (userId === null) {
      return;
    }

    const socket = io('/presence', {
      withCredentials: true,
      autoConnect: false,
    });
    let active = true;
    let retriedAfterRejection = false;

    /**
     * @brief Changes this user's online set. The change is applied to a copy,
     * so React sees a new object and re-renders.
     */
    const updateOnlineUsers = (change: (onlineUsers: Set<string>) => void) => {
      setPresence((previous) => {
        const onlineUsers = new Set(
          previous?.userId === userId ? previous.onlineUsers : [],
        );
        change(onlineUsers);
        return { userId, onlineUsers };
      });
    };

    socket.on(
      'presence:sync',
      ({ onlineFriends }: { onlineFriends: string[] }) => {
        retriedAfterRejection = false;
        setPresence({ userId, onlineUsers: new Set(onlineFriends) });
      },
    );

    socket.on('presence:online', ({ userId: friendId }: { userId: string }) => {
      updateOnlineUsers((onlineUsers) => {
        onlineUsers.add(friendId);
      });
    });

    socket.on(
      'presence:offline',
      ({ userId: friendId }: { userId: string }) => {
        updateOnlineUsers((onlineUsers) => {
          onlineUsers.delete(friendId);
        });
      },
    );

    /*
     * The server only checks the access token when a socket connects, and
     * hangs up on the sockets it rejects. socket.io reconnects on its own
     * after a network drop, possibly with a token that expired meanwhile, but
     * never after being hung up on. So refresh the session once and try
     * again; if nobody is logged in anymore, stay disconnected.
     */
    socket.on('disconnect', async (reason) => {
      if (reason !== 'io server disconnect' || retriedAfterRejection) {
        return;
      }

      retriedAfterRejection = true;
      const user = await getCurrentUser();

      if (active && user?.id === userId) {
        socket.connect();
      }
    });

    socket.connect();

    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [userId]);

  const onlineUsers =
    userId !== null && presence?.userId === userId
      ? presence.onlineUsers
      : null;

  return (
    <PresenceContext
      value={{
        onlineUsers,
        isOnline: (id) => onlineUsers?.has(id) ?? false,
      }}
    >
      {children}
    </PresenceContext>
  );
}
