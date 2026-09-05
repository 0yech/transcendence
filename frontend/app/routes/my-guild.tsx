import { redirect } from 'react-router';
import apiFetch from '~/utils/api-fetch';
import {
  GuildDetails,
  type Guild,
  type GuildMember,
} from '~/components/guilds/GuildDetails';
import { GuildCreation } from '~/components/guilds/GuildCreation';
import type { GuildInvitation } from '~/components/guilds/GuildInvitations';
import type { Route } from './+types/my-guild';
import { NavBar } from '~/components/Navbar';

type GuildActionIntent =
  | 'create-guild'
  | 'accept-invitation'
  | 'decline-invitation'
  | 'invite-user'
  | 'kick-member'
  | 'leave-guild'
  | 'delete-guild'
  | 'promote-member'
  | 'demote-member'
  | 'transfer-guild';

interface MyGuildLoaderData {
  guild: Guild | null;
  invitations: GuildInvitation[];
  currentUser: Pick<GuildMember, 'id' | 'guildRole'> | null;
}

interface ApiErrorBody {
  message?: string | string[];
}

/**
 * @brief Checks whether a form intent belongs to a supported guild action.
 *
 * @param intent The value received from the submitted form.
 * @return True when the intent is a valid guild action.
 */
function isGuildActionIntent(
  intent: FormDataEntryValue | null,
): intent is GuildActionIntent {
  return (
    intent === 'create-guild' ||
    intent === 'accept-invitation' ||
    intent === 'decline-invitation' ||
    intent === 'invite-user' ||
    intent === 'kick-member' ||
    intent === 'leave-guild' ||
    intent === 'delete-guild' ||
    intent === 'promote-member' ||
    intent === 'demote-member' ||
    intent === 'transfer-guild'
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
 * @brief Loads the data required by the authenticated user's guild page.
 *
 * Users without a guild receive their pending invitations.
 * Users inside a guild receive their id and guild role for permission checks.
 *
 * @return The current guild page data.
 */
export async function clientLoader(): Promise<MyGuildLoaderData> {
  const guildResponse = await apiFetch('/api/guilds/me');

  if (!guildResponse.ok) {
    throw new Error('Failed to fetch guild');
  }

  const guildText = await guildResponse.text();

  const guild = guildText ? (JSON.parse(guildText) as Guild) : null;

  /*
   * A user without a guild only needs their pending invitations.
   */
  if (!guild) {
    const invitationsResponse = await apiFetch('/api/guilds/invitations');

    if (!invitationsResponse.ok) {
      throw new Error('Failed to fetch guild invitations');
    }

    const invitations = (await invitationsResponse.json()) as GuildInvitation[];

    return {
      guild: null,
      invitations,
      currentUser: null,
    };
  }

  /*
   * Guild management actions need the authenticated user's id and role.
   */
  const currentUserResponse = await apiFetch('/api/auth/me');

  if (!currentUserResponse.ok) {
    throw new Error('Failed to fetch current user');
  }

  const currentUser = (await currentUserResponse.json()) as Pick<
    GuildMember,
    'id' | 'guildRole'
  >;

  return {
    guild,
    invitations: [],
    currentUser,
  };
}

/**
 * @brief Handles every guild action submitted from /guilds/me.
 *
 * @param request The request containing the submitted form data.
 * @return An error object when the action fails, otherwise redirects
 * to the refreshed guild page.
 */
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('_intent');

  if (!isGuildActionIntent(intent)) {
    return {
      intent: null,
      error: 'Unknown guild action',
    };
  }

  if (intent === 'create-guild') {
    const name = formData.get('name');

    if (typeof name !== 'string' || !name.trim()) {
      return {
        intent,
        error: 'Guild name is required',
      };
    }

    const response = await apiFetch('/api/guilds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
      }),
    });

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(response, 'Failed to create guild'),
      };
    }

    return redirect('/guilds/me');
  }

  if (intent === 'leave-guild') {
    const response = await apiFetch('/api/guilds/leave', {
      method: 'POST',
    });

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(response, 'Failed to leave guild'),
      };
    }

    return redirect('/guilds/me');
  }

  if (intent === 'delete-guild') {
    const response = await apiFetch('/api/guilds', {
      method: 'DELETE',
    });

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(response, 'Failed to delete guild'),
      };
    }

    return redirect('/guilds/me');
  }

  if (intent === 'accept-invitation') {
    const invitationId = formData.get('invitationId');

    if (typeof invitationId !== 'string' || !invitationId.trim()) {
      return {
        intent,
        error: 'Invitation id is required',
      };
    }

    const response = await apiFetch(
      `/api/guilds/invitations/${invitationId}/accept`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(
          response,
          'Failed to accept guild invitation',
        ),
      };
    }

    return redirect('/guilds/me');
  }

  if (intent === 'decline-invitation') {
    const invitationId = formData.get('invitationId');

    if (typeof invitationId !== 'string' || !invitationId.trim()) {
      return {
        intent,
        error: 'Invitation id is required',
      };
    }

    const response = await apiFetch(
      `/api/guilds/invitations/${invitationId}/decline`,
      {
        method: 'POST',
      },
    );

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(
          response,
          'Failed to decline guild invitation',
        ),
      };
    }

    return redirect('/guilds/me');
  }

  if (intent === 'invite-user') {
    const username = formData.get('username');

    if (typeof username !== 'string' || !username.trim()) {
      return {
        intent,
        error: 'Username is required',
      };
    }

    const response = await apiFetch('/api/guilds/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
      }),
    });

    if (!response.ok) {
      return {
        intent,
        error: await getApiErrorMessage(response, 'Failed to invite user'),
      };
    }

    return {
      intent,
      success: 'User has been invited',
    };
  }

  /*
   * Member management actions all target a guild member and use
   * the same API route pattern:
   *
   * POST /api/guilds/members/:memberId/:action
   *
   * Leave/delete are handled earlier because they do not target
   * an individual guild member.
   */
  const memberId = formData.get('memberId');

  if (typeof memberId !== 'string' || !memberId.trim()) {
    return {
      intent,
      error: 'Member id is required',
    };
  }

  let action: string;
  let fallbackError: string;

  if (intent === 'kick-member') {
    action = 'kick';
    fallbackError = 'Failed to kick guild member';
  } else if (intent === 'promote-member') {
    action = 'promote';
    fallbackError = 'Failed to promote guild member';
  } else if (intent === 'demote-member') {
    action = 'demote';
    fallbackError = 'Failed to demote guild member';
  } else if (intent === 'transfer-guild') {
    action = 'transfer';
    fallbackError = 'Failed to transfer guild ownership';
  } else {
    return {
      intent,
      error: 'Unknown member action',
    };
  }

  const response = await apiFetch(`/api/guilds/members/${memberId}/${action}`, {
    method: 'POST',
  });

  if (!response.ok) {
    return {
      intent,
      error: await getApiErrorMessage(response, fallbackError),
    };
  }

  return redirect('/guilds/me');
}

/**
 * @brief Displays either the user's guild or the no-guild page.
 *
 * @param loaderData The data loaded for the current guild state.
 * @param actionData The result of the last guild action.
 * @return The authenticated user's guild page.
 */
export default function MyGuild({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { guild, invitations, currentUser } = loaderData;

  if (!guild) {
    const creationError =
      actionData?.intent === 'create-guild' ? actionData.error : undefined;

    const invitationError =
      actionData?.intent === 'accept-invitation' ||
      actionData?.intent === 'decline-invitation'
        ? actionData.error
        : undefined;

    return (
      <>
        <title>Guild</title>
        <NavBar></NavBar>
        <GuildCreation
          invitations={invitations}
          creationError={creationError}
          invitationError={invitationError}
        />
      </>
    );
  }

  if (!currentUser) {
    throw new Error('Current user is missing');
  }

  const inviteError =
    actionData?.intent === 'invite-user' ? actionData.error : undefined;

  const memberActionError =
    actionData?.intent === 'kick-member' ||
    actionData?.intent === 'promote-member' ||
    actionData?.intent === 'demote-member' ||
    actionData?.intent === 'transfer-guild'
      ? actionData.error
      : undefined;

  const guildActionError =
    actionData?.intent === 'leave-guild' ||
    actionData?.intent === 'delete-guild'
      ? actionData.error
      : undefined;

  const inviteSuccess =
    actionData?.intent === 'invite-user' ? actionData.success : undefined;

  return (
    <>
      <title>{guild.name}</title>
      <NavBar></NavBar>
      <GuildDetails
        guild={guild}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.guildRole}
        inviteError={inviteError}
        inviteSuccess={inviteSuccess}
        memberActionError={memberActionError}
        guildActionError={guildActionError}
      />
    </>
  );
}
