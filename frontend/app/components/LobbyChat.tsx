import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { io } from 'socket.io-client';
import apiFetch from '~/utils/api-fetch';
import { setChatSocket } from '~/utils/chatSocket';
import { Input } from './Input';
import { cardStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

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
  className?: string;
  code: string;
  canSend: boolean;
}

/*
  Written as full class names because Tailwind drops classes built at runtime
  such as `text-${color}`.
*/
const AUTHOR_COLORS = [
  'text-pink',
  'text-mid-light-blue',
  'text-green',
  'text-yellow',
  'text-orange',
  'text-light-pink',
  'text-green',
];

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
export default function LobbyChat({
  className,
  code,
  canSend,
}: LobbyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   *
   * @brief give each author a color, handed out in the order they first speak
   *
   * messages are sorted by creation date, so every client walks them in the
   * same order and ends up with the same colors
   */
  const authorColors = useMemo(() => {
    const colors = new Map<string, string>();

    for (const message of messages) {
      if (!colors.has(message.author.id)) {
        colors.set(
          message.author.id,
          AUTHOR_COLORS[colors.size % AUTHOR_COLORS.length],
        );
      }
    }

    return colors;
  }, [messages]);

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

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', () => {
      setConnected(false);
      setError('Chat connection failed');
    });

    socket.connect();

    return () => {
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
    <div
      className={twMerge(
        'flex flex-col backdrop-blur-xs gap-2 h-200 w-70',
        className,
      )}
    >
      <p>Chat: {connected ? 'connected' : 'disconnected'}</p>

      {error && <p>{error}</p>}

      <ul
        className={twMerge(
          cardStyle,
          'overflow-y-auto gap-2 flex flex-col-reverse h-full whitespace-pre-wrap wrap-break-word overscroll-contain',
        )}
      >
        {[...messages].reverse().map((message) => (
          <li key={message.id}>
            <strong className={authorColors.get(message.author.id)}>
              {message.author.username}:
            </strong>
            <br />
            {'   '}
            {message.content}
          </li>
        ))}
      </ul>

      {canSend ? (
        <form className="flex flex-col gap-2" onSubmit={sendMessage}>
          {/*
            This limit mirrors CreateMessageDto in
            backend/src/chats/dto/create-message.dto.ts. Keep them in sync.
          */}
          <Input
            variant="textarea"
            className="w-full"
            id="chat-input"
            type="text"
            placeholder="Type your message here..."
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
          />
          <Button
            type="submit"
            variant="accept"
            disabled={!connected || !content.trim()}
          >
            Send
          </Button>
        </form>
      ) : (
        <p>Join the lobby to send messages.</p>
      )}
    </div>
  );
}
