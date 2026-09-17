import { createContext } from 'react';

/**
 * The presence state shared with components.
 */
interface InterfacePresenceContext {
  /**
   * Ids of the logged-in user's friends who are online right now, or null
   * while nobody is logged in or before the server's first sync.
   */
  onlineUsers: Set<string> | null;
  /** Whether the given user is currently online. */
  isOnline: (userId: string) => boolean;
}

/**
 * Used by components to know and display online status of users.
 */
export const PresenceContext = createContext<InterfacePresenceContext | null>(
  null,
);
