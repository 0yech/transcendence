export const publicGuildMemberSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  guildRole: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const publicGuildSelect = {
  id: true,
  name: true,
  level: true,
  points: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      members: true,
    },
  },
  members: {
    select: publicGuildMemberSelect,
    orderBy: {
      username: 'asc',
    },
  },
} as const;

export const publicGuildInvitationSelect = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  guild: {
    select: {
      id: true,
      name: true,
      level: true,
      points: true,
    },
  },
  sender: {
    select: publicGuildMemberSelect,
  },
  receiver: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  },
} as const;
