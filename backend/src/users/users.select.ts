export const userIdentitySelect = {
  id: true,
  username: true,
} as const;

export const publicViewUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  lobbyId: true,
  gamePlayers: {
    select: {
      id: true,
      eliminatedAt: true,
      eliminatedPosition: true,
      pointWon: true,
      game: {
        select: {
          id: true,
          status: true,
          winnerId: true,
          createdAt: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  totalPts: true,
  guildId: true,
  guildRole: true,
  sentGuildInvitations: true,
  createdAt: true,
  deleted: true,
} as const;

export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  avatarUrl: true,
  lobbyId: true,
  gamePlayers: {
    select: {
      id: true,
      eliminatedAt: true,
      eliminatedPosition: true,
      pointWon: true,
      game: {
        select: {
          id: true,
          status: true,
          winnerId: true,
          createdAt: true,
          startedAt: true,
          finishedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
  totalPts: true,
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
  deleted: true,
} as const;
