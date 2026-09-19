import type { Socket } from 'socket.io-client';

let chatSocket: Socket | null = null;

export function setChatSocket(socket: Socket | null) {
  chatSocket = socket;
}

/**
 *
 * @brief Ensures a user is connected to the chat (for kicked player purposes)
 *
 * Chat websocket connects when the lobby page shows, so when a user is kicked
 * they need to reconnect. This function reconnects the user on lobbyjoin if not
 * already connected
 */
export function ensureChatConnection() {
  if (chatSocket && !chatSocket.connected) {
    chatSocket.connect();
  }
}
