import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import {
  buttonCreate,
  primaryCardClass,
  tableContainerClass,
} from '~/styles/theme';

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
    <section className={primaryCardClass}>
      <h2 className="text-3xl font-black sm:text-4xl">Guild invitations</h2>

      {invitations.length === 0 ? (
        <p className="mt-4 opacity-60">
          You have no pending guild invitations.
        </p>
      ) : (
        <div className={`mt-5 ${tableContainerClass}`}>
          <table className="w-full min-w-175 text-left">
            <thead className="text-sm uppercase tracking-wider text-light-pink">
              <tr>
                <th className="px-5 py-4">Guild</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Points</th>
                <th className="px-5 py-4">Invited by</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invitations.map((invitation) => {
                return (
                  <tr key={invitation.id} className="hover:bg-pink/10">
                    <td className="border-t border-light-pink/10 px-5 py-4 text-xl font-bold">
                      {invitation.guild.name}
                    </td>
                    <td className="border-t border-light-pink/10 px-5 py-4">
                      {invitation.guild.level}
                    </td>
                    <td className="border-t border-light-pink/10 px-5 py-4 font-bold text-pink">
                      {invitation.guild.points}
                    </td>
                    <td className="border-t border-light-pink/10 px-5 py-4">
                      {invitation.sender.username}
                    </td>
                    <td className="border-t border-light-pink/10 px-5 py-4">
                      <div className="flex gap-2">
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
                          <Button
                            variant="accept"
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 text-base ${buttonCreate}`}
                          >
                            Accept
                          </Button>
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

                          <Button
                            variant="danger"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 text-base"
                          >
                            Decline
                          </Button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="mt-4 font-bold text-danger">{error}</p>}
    </section>
  );
}
