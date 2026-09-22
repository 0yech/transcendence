import { Form, Link, useNavigation } from 'react-router';
import { Avatar } from '~/components/Avatar';
import { Button } from '~/components/Button';
import {
  cardStyle,
  cardDarkStyle,
  errorCardStyle,
  textTitle2Style,
  textDiscretStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

import type { FriendInvitation } from '~/utils/friends';

/* Table styles, shared by every table of the site. */
const thStyle =
  'px-5 py-4 text-sm font-bold uppercase tracking-wider text-light-pink';
const tdStyle = 'border-t border-gray px-5 py-4';

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
    <section className={cardStyle}>
      <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
        Invitations
      </h2>

      {invitations.length === 0 ? (
        <p className={textDiscretStyle}>No pending invitations.</p>
      ) : (
        <div className={twMerge(cardDarkStyle, 'p-0 overflow-x-auto')}>
          <table className="w-full min-w-150 text-left">
            <thead>
              <tr>
                <th className={thStyle}>Player</th>
                <th className={thStyle}>Received</th>
                <th className={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-pink/10">
                  <td className={tdStyle}>
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

                  <td className={tdStyle}>
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </td>

                  <td className={tdStyle}>
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
                          className="px-4 text-base"
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className={twMerge(errorCardStyle, 'mt-4')}>{error}</p>}
    </section>
  );
}
