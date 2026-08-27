import { useContext } from 'react';
import { WebsocketContext } from './WebSocketContext';

/**
 *
 * @brief create the context for the context api. wrapper is inside WebSocketProvider.tsx but context is created here and returned here
 * @brief Used to access the function and the gamestate
 *
 * @returns the context itself
 *
 */
export function UseWebSocket() {
  const context = useContext(WebsocketContext);

  if (!context) {
    throw new Error('useWebSocket must be used inside WebSocketRef');
  }

  return context;
}
