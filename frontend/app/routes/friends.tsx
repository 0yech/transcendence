import { redirect } from 'react-router';
import type { Route } from './+types/friends';
import apiFetch from '~/utils/api-fetch';
import { getUserByUsername } from '~/utils/users';
import {
  getFriends,
  getFriendInvitations,
  type Friend,
  type FriendInvitation,
} from '~/utils/friends';
import { FriendList } from '~/components/friends/FriendList';
import { FriendInvitations } from '~/components/friends/FriendInvitations';
import { AddFriend } from '~/components/friends/AddFriend';
import { NavBar } from '~/components/Navbar';
import { eyebrowClass, pageContentClass, pageShellClass } from '~/styles/theme';

type FriendActionIntent =
  | 'invite-friend'
  | 'remove-friend'
  | 'accept-invitation'
  | 'decline-invitation';

interface FriendsLoaderData {
  friends: Friend[];
  invitations: FriendInvitation[];
}

interface ApiErrorBody {
  message?: string | string[];
}

/**
 * @brief Checks whether a form intent belongs to a supported friend action.
 *
 * @param intent The value received from the submitted form.
 * @return True when the intent is a valid friend action.
 */
function isFriendActionIntent(
  intent: FormDataEntryValue | null,
): intent is FriendActionIntent {
  return (
    intent === 'invite-friend' ||
    intent === 'remove-friend' ||
    intent === 'accept-invitation' ||
    intent === 'decline-invitation'
  );
}

/**
 * @brief Retrieves the error message returned by the backend.
 *
 * NestJS can return either a string or an array of validation messages.
 *
 * @param response The failed backend response.
 * @param fallback The fallback message when no backend message is available.
 * @return The error message to display to the user.
 */
async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const data = (await response.json().catch(() => null)) as ApiErrorBody | null;

  const message = data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  return fallback;
}

/**
 * @brief Loads the friends and pending invitations of the authenticated user.
 *
 * @return The friends page data.
 */
export async function clientLoader(): Promise<FriendsLoaderData> {
  const [friends, invitations] = await Promise.all([
    getFriends(),
    getFriendInvitations(),
  ]);

  return {
    friends,
    invitations,
  };
}

/**
 * @brief Handles every friend action submitted from /friends.
 *
 * @param request The request containing the submitted form data.
 * @return An error object when the action fails, otherwise redirects
 * to the refreshed friends page.
 */
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('_intent');

  if (!isFriendActionIntent(intent)) {
    return {
      intent: null,
      error: 'Unknown friend action',
    };
  }

  /*
   * The invite route is keyed by user id, but a username is what a player
   * actually knows, so it is resolved first.
   */
  if (intent === 'invite-friend') {
    const username = formData.get('username');

    if (typeof username !== 'string' || !username.trim()) {
      return {
        intent,
        error: 'Username is required',
      };
    }

    let targetUserId: string;

    try {
      const target = await getUserByUsername(username.trim());

      targetUserId = target.id;
    } catch {
      return {
        intent,
        error: 'User not found',
      };
    }

    const response = await apiFetch(
      `/api/users/friends/invite/${targetUserId}`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(
          response,
          'Failed to send friend invitation',
        ),
      };
    }

    return {
      intent,
      success: `Invitation sent to ${username.trim()}`,
    };
  }

  if (intent === 'remove-friend') {
    const userId = formData.get('userId');

    if (typeof userId !== 'string' || !userId.trim()) {
      return {
        intent,
        error: 'User id is required',
      };
    }

    const response = await apiFetch(`/api/users/friends/remove/${userId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(response, 'Failed to remove friend'),
      };
    }

    return redirect('/friends');
  }

  /*
   * Accept and decline share the same route pattern:
   *
   * POST /api/users/friends/invitations/:id/:action
   */
  const invitationId = formData.get('invitationId');

  if (typeof invitationId !== 'string' || !invitationId.trim()) {
    return {
      intent,
      error: 'Invitation id is required',
    };
  }

  const action = intent === 'accept-invitation' ? 'accept' : 'decline';

  const fallbackError =
    intent === 'accept-invitation'
      ? 'Failed to accept friend invitation'
      : 'Failed to decline friend invitation';

  const response = await apiFetch(
    `/api/users/friends/invitations/${invitationId}/${action}`,
    {
      method: 'POST',
    },
  );

  if (!response.ok) {
    return {
      intent,
      error: await getApiErrorMessage(response, fallbackError),
    };
  }

  return redirect('/friends');
}

/**
 * @brief Displays the authenticated user's friends page.
 *
 * @param loaderData The friends and pending invitations.
 * @param actionData The result of the last friend action.
 * @return The friends page.
 */
export default function Friends({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { friends, invitations } = loaderData;

  const inviteError =
    actionData?.intent === 'invite-friend' ? actionData.error : undefined;

  const inviteSuccess =
    actionData?.intent === 'invite-friend' ? actionData.success : undefined;

  const friendError =
    actionData?.intent === 'remove-friend' ? actionData.error : undefined;

  const invitationError =
    actionData?.intent === 'accept-invitation' ||
    actionData?.intent === 'decline-invitation'
      ? actionData.error
      : undefined;

  return (
    <>
      <title>Friends</title>
      <NavBar></NavBar>

      <main className={pageShellClass}>
        <div className={pageContentClass}>
          <div>
            <p className={eyebrowClass}>Community</p>
            <h1 className="text-4xl font-black sm:text-6xl">Friends</h1>
            <p className="mt-2 opacity-70">
              Keep track of your friends and jump straight into their lobby.
            </p>
          </div>

          <FriendList friends={friends} error={friendError} />

          <FriendInvitations
            invitations={invitations}
            error={invitationError}
          />

          <AddFriend error={inviteError} success={inviteSuccess} />
        </div>
      </main>
    </>
  );
}
