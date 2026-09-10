import apiFetch from './api-fetch';

/** The lobby a friend is currently sitting in, when there is one. */
export interface FriendLobby {
  code: string;
  active: boolean;
  private: boolean;
  _count: {
    users: number;
  };
}

export interface Friend {
  id: string;
  username: string;
  avatarUrl: string | null;
  totalPts: number;
  guildRole: string | null;
  guild: {
    id: string;
    name: string;
  } | null;
  lobbyId: string | null;
  lobby: FriendLobby | null;
  deleted: boolean;
}

export interface FriendInvitation {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

/** `GET /api/users/friends/me` answers with wrappers, not bare users. */
interface FriendRelation {
  friend: Friend;
}

/**
 * @brief Ranks a friend for display: whoever can be joined comes first.
 *
 * @param friend The friend to rank.
 * @return 0 when the friend sits in a joinable lobby, 1 otherwise.
 */
function joinablePriority(friend: Friend): number {
  return friend.lobby?.active ? 0 : 1;
}

/**
 * @brief Retrieves the authenticated user's friends.
 *
 * Deleted accounts stay in the backend's list, anonymised, so they are
 * filtered out here. The backend returns no defined order, so friends who
 * are in a lobby are floated to the top and the rest sorted by username.
 *
 * @return The friends to display.
 */
export async function getFriends(): Promise<Friend[]> {
  const response = await apiFetch('/api/users/friends/me');

  if (!response.ok) {
    throw new Error('Failed to fetch friends');
  }

  const relations = (await response.json()) as FriendRelation[];

  return relations
    .map((relation) => relation.friend)
    .filter((friend) => !friend.deleted)
    .sort((a, b) => {
      const priorityDifference = joinablePriority(a) - joinablePriority(b);

      if (priorityDifference !== 0) return priorityDifference;

      return a.username.localeCompare(b.username);
    });
}

/**
 * @brief Retrieves the pending friend invitations addressed to the user.
 *
 * @return The pending invitations, newest first.
 */
export async function getFriendInvitations(): Promise<FriendInvitation[]> {
  const response = await apiFetch('/api/users/friends/invitations/me');

  if (!response.ok) {
    throw new Error('Failed to fetch friend invitations');
  }

  const invitations = (await response.json()) as FriendInvitation[];

  return invitations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
