import { useContext } from 'react';
import { PresenceContext } from './PresenceContext';

/**
 * @brief Reads the presence state published by PresenceProvider.
 *
 * @return The online friends, and an isOnline helper.
 */
export function usePresence() {
  const context = useContext(PresenceContext);

  if (!context) {
    throw new Error('usePresence must be used inside PresenceProvider');
  }

  return context;
}
