export const publicUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

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
