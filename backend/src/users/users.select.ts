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
    take: 20,
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
    take: 20,
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

export const lobbyUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  totalPts: true,
  guildRole: true,
  guild: {
    select: {
      name: true,
    },
  },
};

/**
 * A friend's public profile, plus the lobby they are currently in.
 *
 * The lobby relation is exposed here and not in `publicViewUserSelect` on
 * purpose: joining a lobby only needs its code, and `joinLobby` does not check
 * the `private` flag. Handing the code out on the public profile routes would
 * let any user walk into any private lobby, so only accepted friends get it.
 */
export const friendUserSelect = {
  ...publicViewUserSelect,
  lobby: {
    select: {
      code: true,
      active: true,
      private: true,
      _count: {
        select: {
          users: true,
        },
      },
    },
  },
} as const;
