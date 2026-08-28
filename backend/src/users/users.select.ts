export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  guildId: true,
  guildRole: true,
  guild: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;