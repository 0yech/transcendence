export const publicMessageSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
    },
  },
} as const;
