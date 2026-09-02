import { Form, useNavigation } from 'react-router';

import type { GuildMember } from './GuildDetails';

export interface GuildInvitation {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  guild: {
    id: string;
    name: string;
    level: number;
    points: number;
  };
  sender: GuildMember;
  receiver: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

interface GuildInvitationsProps {
  invitations: GuildInvitation[];
  error?: string;
}

/**
 * @brief Displays the pending guild invitations received by the user.
 *
 * Allows the user to accept or decline each invitation.
 *
 * @param invitations The pending guild invitations.
 * @param error An optional error returned by an invitation action.
 * @return The guild invitation list.
 */
export function GuildInvitations({
  invitations,
  error,
}: GuildInvitationsProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <section>
      <h2>Guild invitations</h2>

      {invitations.length === 0 ? (
        <p>You have no pending guild invitations.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Guild</th>
              <th>Level</th>
              <th>Points</th>
              <th>Invited by</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {invitations.map((invitation) => {
              return (
                <tr key={invitation.id}>
                  <td>{invitation.guild.name}</td>
                  <td>{invitation.guild.level}</td>
                  <td>{invitation.guild.points}</td>
                  <td>{invitation.sender.username}</td>
                  <td>
                    <Form method="post">
                      <input
                        type="hidden"
                        name="_intent"
                        value="accept-invitation"
                      />
                      <input
                        type="hidden"
                        name="invitationId"
                        value={invitation.id}
                      />
                      <button type="submit" disabled={isSubmitting}>
                        Accept
                      </button>
                    </Form>

                    <Form method="post">
                      <input
                        type="hidden"
                        name="_intent"
                        value="decline-invitation"
                      />
                      <input
                        type="hidden"
                        name="invitationId"
                        value={invitation.id}
                      />

                      <button type="submit" disabled={isSubmitting}>
                        Decline
                      </button>
                    </Form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {error && <p>{error}</p>}
    </section>
  );
}
