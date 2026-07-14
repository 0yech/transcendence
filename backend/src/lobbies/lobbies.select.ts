import { publicUserSelect } from 'src/users/users.select';

export const publicChatSelect = {
  id: true,
  lobbyId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const publicLobbySelect = {
  id: true,
  code: true,
  active: true,
  private: true,
  createdAt: true,
  updatedAt: true,

  users: {
    select: publicUserSelect,
  },

  chat: {
    select: publicChatSelect,
  },
} as const;
