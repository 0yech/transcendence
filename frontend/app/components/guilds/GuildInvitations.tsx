import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import {
  cardStyle,
  cardDarkStyle,
  errorCardStyle,
  textTitle2Style,
  textDiscretStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

import type { GuildMember } from './GuildDetails';

/* Table styles, shared by every table of the site. */
const thStyle =
  'px-5 py-4 text-sm font-bold uppercase tracking-wider text-light-pink';
const tdStyle = 'border-t border-gray px-5 py-4';

export interface GuildInvitation {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  guild: {
    id: string;
    name: string;
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
    <section className={cardStyle}>
      <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
        Invitations
      </h2>

      {invitations.length === 0 ? (
        <p className={textDiscretStyle}>No pending invitations.</p>
      ) : (
        <div className={twMerge(cardDarkStyle, 'p-0 overflow-x-auto')}>
          <table className="w-full min-w-175 text-left">
            <thead>
              <tr>
                <th className={thStyle}>Guild</th>
                <th className={thStyle}>Points</th>
                <th className={thStyle}>Invited by</th>
                <th className={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-pink/10">
                  <td className={twMerge(tdStyle, 'text-xl font-bold')}>
                    {invitation.guild.name}
                  </td>
                  <td className={twMerge(tdStyle, 'font-bold text-blue')}>
                    {invitation.guild.points}
                  </td>
                  <td className={tdStyle}>{invitation.sender.username}</td>
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
