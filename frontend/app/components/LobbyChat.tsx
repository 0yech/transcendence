import { useEffect, useState, type SyntheticEvent } from 'react';
import { io } from 'socket.io-client';
import apiFetch from '~/utils/api-fetch';
<<<<<<< HEAD
import { getCurrentUser } from '~/utils/users';
=======
import { setChatSocket } from '~/utils/chatSocket';
>>>>>>> origin/main

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface LobbyChatProps {
  code: string;
  canSend: boolean;
}

/**
 *
 * @brief merge chat messages without duplicates and sort them by creation date
 *
 * @param current current messages already displayed
 * @param incoming new messages to add
 *
 * @returns merged and sorted messages
 */
function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const messages = new Map<string, ChatMessage>();

  for (const message of [...current, ...incoming]) {
    messages.set(message.id, message);
  }

  return Array.from(messages.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/**
 *
 * @brief lobby chat component. connects automatically to /chats,
 * joins the lobby socket room and loads previous messages
 *
 * @param code lobby code used to join the chat room and fetch messages
 *
 * @returns lobby chat messages and message input
 */
export default function LobbyChat({ code, canSend }: LobbyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   *
   * @brief connect to chat websocket and automatically join the lobby room
   *
   * listens for new messages and disconnects when the component is removed
   */
  useEffect(() => {
    const socket = io('/chats', {
      autoConnect: false,
      withCredentials: true,
    });
<<<<<<< HEAD

    let active = true;
    let retriedAfterRejection = false;

=======
    setChatSocket(socket);
>>>>>>> origin/main
    const onMessageCreated = (message: ChatMessage) => {
      setMessages((current) => mergeMessages(current, [message]));
    };

    const joinLobby = () => {
      socket.emit(
        'lobby:join',
        { code },
        async (response: { success: boolean }) => {
          if (!response?.success) {
            setError('Could not join lobby chat');
            return;
          }

<<<<<<< HEAD
          setConnected(true);
          retriedAfterRejection = false;

=======
>>>>>>> origin/main
          try {
            const historyResponse = await apiFetch(
              `/api/lobbies/${encodeURIComponent(code)}/messages`,
            );

            if (!historyResponse.ok) {
              throw new Error('Could not load messages');
            }

            const history: ChatMessage[] = await historyResponse.json();

            setMessages((current) => mergeMessages(history, current));
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not load messages',
            );
          }
        },
      );
    };

    const onConnect = () => {
      setConnected(true);
      joinLobby();
    };

    socket.on('connect', onConnect);

    socket.on('message:created', onMessageCreated);

    /*
     * The gateway only checks the access token when a socket connects, and
     * hangs up on the sockets it rejects. socket.io reconnects on its own after
     * a network drop, possibly with a token that expired meanwhile, but never
     * after being hung up on. So refresh the session once and try again; if
     * nobody is logged in anymore, stay disconnected.
     */
    socket.on('disconnect', async (reason) => {
      setConnected(false);

      if (reason !== 'io server disconnect' || retriedAfterRejection) {
        return;
      }

      retriedAfterRejection = true;
      const user = await getCurrentUser();

      // The panel may have been unmounted while refreshing.
      if (!active || !user) {
        return;
      }

      socket.connect();
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setError('Chat connection failed');
    });

    socket.connect();

    return () => {
<<<<<<< HEAD
      active = false;
      socket.off('connect', joinLobby);
=======
      socket.off('connect', onConnect);
>>>>>>> origin/main
      socket.off('message:created', onMessageCreated);
      socket.disconnect();
      setChatSocket(null);
    };
  }, [code]);

  /**
   *
   * @brief send a new message to the current lobby
   *
   * @param event chat form submit event
   */
  async function sendMessage(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const messageContent = content.trim();

    if (!messageContent) {
      return;
    }

    try {
      const response = await apiFetch(
        `/api/lobbies/${encodeURIComponent(code)}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Could not send message');
      }

      const message: ChatMessage = await response.json();

      setMessages((current) => mergeMessages(current, [message]));
      setContent('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    }
  }

  return (
    <div>
      <p>Chat: {connected ? 'connected' : 'disconnected'}</p>

      {error && <p>{error}</p>}

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.author.username}:</strong> {message.content}
          </li>
        ))}
      </ul>

      {canSend ? (
        <form onSubmit={sendMessage}>
          {/*
            This limit mirrors CreateMessageDto inimport { useEffect, useState, type SyntheticEvent } from 'react';
import { io } from 'socket.io-client';
import apiFetch from '~/utils/api-fetch';
import { setChatSocket } from '~/utils/chatSocket';
import { getCurrentUser } from '~/utils/users';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface LobbyChatProps {
  code: string;
  canSend: boolean;
}

/**
 *
 * @brief merge chat messages without duplicates and sort them by creation date
 *
 * @param current current messages already displayed
 * @param incoming new messages to add
 *
 * @returns merged and sorted messages
 */
function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  const messages = new Map<string, ChatMessage>();

  for (const message of [...current, ...incoming]) {
    messages.set(message.id, message);
  }

  return Array.from(messages.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/**
 *
 * @brief lobby chat component. connects automatically to /chats,
 * joins the lobby socket room and loads previous messages
 *
 * @param code lobby code used to join the chat room and fetch messages
 *
 * @returns lobby chat messages and message input
 */
export default function LobbyChat({ code, canSend }: LobbyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   *
   * @brief connect to chat websocket and automatically join the lobby room
   *
   * listens for new messages and disconnects when the component is removed
   */
  useEffect(() => {
    const socket = io('/chats', {
      autoConnect: false,
      withCredentials: true,
    });

    setChatSocket(socket);

    let active = true;
    let retriedAfterRejection = false;

    const onMessageCreated = (message: ChatMessage) => {
      setMessages((current) => mergeMessages(current, [message]));
    };

    const joinLobby = () => {
      socket.emit(
        'lobby:join',
        { code },
        async (response: { success: boolean }) => {
          if (!response?.success) {
            setError('Could not join lobby chat');
            return;
          }

          retriedAfterRejection = false;

          try {
            const historyResponse = await apiFetch(
              `/api/lobbies/${encodeURIComponent(code)}/messages`,
            );

            if (!historyResponse.ok) {
              throw new Error('Could not load messages');
            }

            const history: ChatMessage[] = await historyResponse.json();

            setMessages((current) => mergeMessages(history, current));
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not load messages',
            );
          }
        },
      );
    };

    const onConnect = () => {
      setConnected(true);
      joinLobby();
    };

    socket.on('connect', onConnect);
    socket.on('message:created', onMessageCreated);

    /*
    * The gateway only checks the access token when a socket connects, and
    * hangs up on the sockets it rejects. socket.io reconnects on its own after
    * a network drop, possibly with a token that expired meanwhile, but never
    * after being hung up on. So refresh the session once and try again; if
    * nobody is logged in anymore, stay disconnected.
    */
    socket.on('disconnect', async (reason) => {
      setConnected(false);

      if (reason !== 'io server disconnect' || retriedAfterRejection) {
        return;
      }

      retriedAfterRejection = true;
      const user = await getCurrentUser();

      // The panel may have been unmounted while refreshing.
      if (!active || !user) {
        return;
      }

      socket.connect();
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setError('Chat connection failed');
    });

    socket.connect();

    return () => {
      active = false;
      socket.off('connect', onConnect);
      socket.off('message:created', onMessageCreated);
      socket.disconnect();
      setChatSocket(null);
    };
  }, [code]);

  /**
   *
   * @brief send a new message to the current lobby
   *
   * @param event chat form submit event
   */
  async function sendMessage(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();

    if (!canSend) {
      return;
    }

    const messageContent = content.trim();

    if (!messageContent) {
      return;
    }

    try {
      const response = await apiFetch(
        `/api/lobbies/${encodeURIComponent(code)}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: messageContent,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Could not send message');
      }

      const message: ChatMessage = await response.json();

      setMessages((current) => mergeMessages(current, [message]));
      setContent('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    }
  }

  return (
    <div>
      <p>Chat: {connected ? 'connected' : 'disconnected'}</p>

      {error && <p>{error}</p>}

      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.author.username}:</strong> {message.content}
          </li>
        ))}
      </ul>

      {canSend ? (
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
          />
          <button type="submit" disabled={!connected || !content.trim()}>
            Send
          </button>
        </form>
      ) : (
        <p>Join the lobby to send messages.</p>
      )}
    </div>
  );
}

            backend/src/chats/dto/create-message.dto.ts. Keep them in sync.
          */}
          <input
            type="text"
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
          />
          <button type="submit" disabled={!connected || !content.trim()}>
            Send
          </button>
        </form>
      ) : (
        <p>Join the lobby to send messages.</p>
      )}
    </div>
  );
}
