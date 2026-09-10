import { Form, Link, useNavigation } from 'react-router';
import { Avatar } from '~/components/Avatar';
import { Button } from '~/components/Button';
import {
  buttonCreate,
  primaryCardClass,
  tableContainerClass,
} from '~/styles/theme';

import type { FriendInvitation } from '~/utils/friends';

interface FriendInvitationsProps {
  invitations: FriendInvitation[];
  error?: string;
}

/**
 * @brief Displays the pending friend invitations received by the user.
 *
 * Allows the user to accept or decline each invitation.
 *
 * @param invitations The pending friend invitations.
 * @param error An optional error returned by an invitation action.
 * @return The friend invitation list.
 */
export function FriendInvitations({
  invitations,
  error,
}: FriendInvitationsProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className={primaryCardClass}>
      <h2 className="text-3xl font-black sm:text-4xl">Friend invitations</h2>

      {invitations.length === 0 ? (
        <p className="mt-4 opacity-60">
          You have no pending friend invitations.
        </p>
      ) : (
        <div className={`mt-5 ${tableContainerClass}`}>
          <table className="w-full min-w-150 text-left">
            <thead className="text-sm uppercase tracking-wider text-light-pink">
              <tr>
                <th className="px-5 py-4">Player</th>
                <th className="px-5 py-4">Received</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invitations.map((invitation) => {
                return (
                  <tr key={invitation.id} className="hover:bg-pink/10">
                    <td className="border-t border-light-pink/10 px-5 py-4">
                      <Link
                        to={`/profile/byUser/${invitation.sender.username}`}
                        className="flex items-center gap-4"
                      >
                        <Avatar
                          className="h-11 w-11"
                          src={invitation.sender.avatarUrl}
                          alt={invitation.sender.username}
                        />
                        <span className="text-xl font-bold hover:text-pink hover:underline hover:decoration-pink">
                          {invitation.sender.username}
                        </span>
                      </Link>
                    </td>

                    <td className="border-t border-light-pink/10 px-5 py-4">
                      {new Date(invitation.createdAt).toLocaleDateString()}
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
