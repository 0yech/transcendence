import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { StylisedLink } from '~/components/StylisedLink';
import {
  cardStyle,
  cardDarkStyle,
  errorCardStyle,
  textTitleStyle,
  textTitle2Style,
  textDiscretStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

/* Table styles, shared by every table of the site. */
const thStyle =
  'px-5 py-4 text-sm font-bold uppercase tracking-wider text-light-pink';
const tdStyle = 'border-t border-gray px-5 py-4';

/* Small rounded badge used inside the members table. */
const pillStyle =
  'rounded-full bg-pink/20 px-3 py-1 text-sm font-bold text-light-pink';

/* Label above a big number. */
const statLabelStyle =
  'text-xs font-bold uppercase tracking-wider text-light-pink';

export interface GuildMember {
  id: string;
  username: string;
  avatarUrl: string | null;
  guildRole: 'LEADER' | 'OFFICER' | 'MEMBER' | null;
  createdAt: string;
  updatedAt: string;
  totalPts: number;
  elo: number;
}

export interface Guild {
  id: string;
  name: string;
  points: number;
  createdAt: string;
  updatedAt: string;

  _count: {
    members: number;
  };

  members: GuildMember[];
}

interface GuildDetailsProps {
  guild: Guild;
  currentUserId: string;
  currentUserRole: GuildMember['guildRole'];
  inviteError?: string;
  inviteSuccess?: string;
  memberActionError?: string;
  guildActionError?: string;
}

/**
 * @brief Checks whether the current user is allowed to kick a guild member.
 *
 * Leaders can kick officers and members.
 * Officers can only kick members.
 *
 * @param currentUserRole The role of the authenticated user.
 * @param memberRole The role of the member targeted by the action.
 * @return True when the member can be kicked.
 */
function canKickMember(
  currentUserRole: GuildMember['guildRole'],
  memberRole: GuildMember['guildRole'],
) {
  if (currentUserRole === 'LEADER') {
    return memberRole === 'OFFICER' || memberRole === 'MEMBER';
  }

  if (currentUserRole === 'OFFICER') {
    return memberRole === 'MEMBER';
  }

  return false;
}

/**
 * @brief Displays the authenticated user's guild.
 *
 * Leaders and officers can invite users and manage members according
 * to their guild permissions.
 *
 * @param guild The authenticated user's guild.
 * @param currentUserId The authenticated user's id.
 * @param currentUserRole The authenticated user's guild role.
 * @param managementError An optional guild management error.
 * @return The guild details page.
 */
export function GuildDetails({
  guild,
  currentUserId,
  currentUserRole,
  inviteError,
  inviteSuccess,
  memberActionError,
  guildActionError,
}: GuildDetailsProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';
  const submittingIntent = navigation.formData?.get('_intent');

  const isLeavingGuild = isSubmitting && submittingIntent === 'leave-guild';
  const isDeletingGuild = isSubmitting && submittingIntent === 'delete-guild';
  const isRenamingGuild = isSubmitting && submittingIntent === 'rename-guild';

  const canManageGuild =
    currentUserRole === 'LEADER' || currentUserRole === 'OFFICER';

  /**
   * Returns the display priority of a guild role.
   * Lower values are displayed first in the members list.
   */
  function getRolePriority(role: GuildMember['guildRole']) {
    switch (role) {
      case 'LEADER':
        return 0;
      case 'OFFICER':
        return 1;
      case 'MEMBER':
        return 2;
      default:
        return 3;
    }
  }

  const sortedMembers = [...guild.members].sort((a, b) => {
    const roleDifference =
      getRolePriority(a.guildRole) - getRolePriority(b.guildRole);

    if (roleDifference !== 0) {
      return roleDifference;
    }

    return a.username.localeCompare(b.username);
  });

  return (
    <main className="pt-30 pb-10 px-4 min-h-dvh w-full flex flex-col items-center">
      <h1
        className={twMerge(
          textTitleStyle,
          'uppercase mb-5 text-center wrap-break-word',
        )}
      >
        {guild.name}
      </h1>

      <div className="w-full max-w-5xl flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-4">
          <div className={cardDarkStyle}>
            <dt className={statLabelStyle}>Points</dt>
            <dd className="mt-1 text-3xl font-black text-blue">
              {guild.points}
            </dd>
          </div>
          <div className={cardDarkStyle}>
            <dt className={statLabelStyle}>Members</dt>
            <dd className="mt-1 text-3xl font-black text-pink">
              {guild._count.members}
            </dd>
          </div>
        </dl>

        {canManageGuild && (
          <section className={cardStyle}>
            <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
              Invite a user
            </h2>

            <Form method="post" className="flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="_intent" value="invite-user" />

              {/*
                Deliberately no length or character rules, matching
                InviteUserDto: this looks up an existing username, and those
                aren't consistently bounded. A rule here would block invites
                to accounts whose names predate it, or that OAuth created.
              */}
              <Input
                variant="textarea"
                className="flex-1 text-base"
                id="guild-invite-username"
                name="username"
                type="text"
                placeholder="Username"
                required
              >
                Username
              </Input>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                Invite
              </Button>
            </Form>

            {inviteError && (
              <p className={twMerge(errorCardStyle, 'mt-4')}>{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-4 rounded-xl border border-accept bg-accept/20 p-2 text-accept">
                {inviteSuccess}
              </p>
            )}
          </section>
        )}

        <section className={cardStyle}>
          <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
            Members
          </h2>

          {guild.members.length === 0 ? (
            <p className={textDiscretStyle}>No members.</p>
          ) : (
            <div className={twMerge(cardDarkStyle, 'p-0 overflow-x-auto')}>
              <table className="w-full min-w-175 text-left">
                <thead>
                  <tr>
                    <th className={thStyle}>Username</th>
                    <th className={thStyle}>Role</th>
                    <th className={thStyle}>Elo</th>
                    <th className={thStyle}>Points</th>

                    {canManageGuild && <th className={thStyle}>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {sortedMembers.map((member) => {
                    const isCurrentUser = member.id === currentUserId;
                    const isLeader = currentUserRole === 'LEADER';
                    const canKick =
                      !isCurrentUser &&
                      canKickMember(currentUserRole, member.guildRole);
                    const canPromote =
                      isLeader && member.guildRole === 'MEMBER';
                    const canDemote =
                      isLeader && member.guildRole === 'OFFICER';
                    const canTransfer = isLeader && !isCurrentUser;

                    return (
                      <tr key={member.id} className="hover:bg-pink/10">
                        <td className={twMerge(tdStyle, 'text-xl font-bold')}>
                          {member.username}
                        </td>
                        <td className={tdStyle}>
                          <span className={pillStyle}>{member.guildRole}</span>
                        </td>
                        <td className={tdStyle}>
                          <span className={pillStyle}>
                            {member.elo.toFixed(0)}
                          </span>
                        </td>
                        <td className={tdStyle}>
                          <span className={pillStyle}>{member.totalPts}</span>
                        </td>

                        {canManageGuild && (
                          <td className={tdStyle}>
                            <div className="flex flex-wrap gap-2">
                              {canKick && (
                                <Form method="post">
                                  <input
                                    type="hidden"
                                    name="_intent"
                                    value="kick-member"
                                  />
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={member.id}
                                  />
                                  <Button
                                    variant="danger"
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 text-base"
                                  >
                                    Kick
                                  </Button>
                                </Form>
                              )}

                              {canPromote && (
                                <Form method="post">
                                  <input
                                    type="hidden"
                                    name="_intent"
                                    value="promote-member"
                                  />
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={member.id}
                                  />
                                  <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 text-base"
                                  >
                                    Promote
                                  </Button>
                                </Form>
                              )}

                              {canDemote && (
                                <Form method="post">
                                  <input
                                    type="hidden"
                                    name="_intent"
                                    value="demote-member"
                                  />
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={member.id}
                                  />
                                  <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 text-base"
                                  >
                                    Demote
                                  </Button>
                                </Form>
                              )}

                              {canTransfer && (
                                <Form method="post">
                                  <input
                                    type="hidden"
                                    name="_intent"
                                    value="transfer-guild"
                                  />
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={member.id}
                                  />
                                  <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 text-base"
                                  >
                                    Transfer
                                  </Button>
                                </Form>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {memberActionError && (
            <p className={twMerge(errorCardStyle, 'mt-4')}>
              {memberActionError}
            </p>
          )}
        </section>

        <section className={cardStyle}>
          <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
            Guild actions
          </h2>

          {currentUserRole === 'LEADER' ? (
            <div className="flex flex-col gap-3">
              <Form method="post" className="flex flex-col gap-3 sm:flex-row">
                <input type="hidden" name="_intent" value="rename-guild" />

                {/*
                  These rules mirror GuildNameDto in
                  backend/src/guilds/dto/guild-name.dto.ts. Keep them in sync:
                  the backend is what actually enforces them.
                */}
                <Input
                  variant="textarea"
                  className="flex-1 text-base"
                  id="guild-name"
                  name="name"
                  type="text"
                  defaultValue={guild.name}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9 _\-]+"
                  title="Letters, numbers, spaces, underscores and hyphens only."
                >
                  Guild name
                </Input>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2"
                >
                  {isRenamingGuild ? 'Renaming...' : 'Rename'}
                </Button>
              </Form>

              <Form
                method="post"
                onSubmit={(event) => {
                  const confirmed = window.confirm(
                    `Are you sure you want to delete "${guild.name}"? This action cannot be undone.`,
                  );

                  if (!confirmed) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="_intent" value="delete-guild" />

                <Button
                  variant="danger"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2"
                >
                  {isDeletingGuild ? 'Deleting...' : 'Delete guild'}
                </Button>
              </Form>
            </div>
          ) : (
            (currentUserRole === 'OFFICER' || currentUserRole === 'MEMBER') && (
              <Form
                method="post"
                onSubmit={(event) => {
                  const confirmed = window.confirm(
                    `Are you sure you want to leave "${guild.name}"?`,
                  );

                  if (!confirmed) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="_intent" value="leave-guild" />

                <Button
                  variant="danger"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2"
                >
                  {isLeavingGuild ? 'Leaving...' : 'Leave guild'}
                </Button>
              </Form>
            )
          )}

          {guildActionError && (
            <p className={twMerge(errorCardStyle, 'mt-4')}>
              {guildActionError}
            </p>
          )}
        </section>

        <StylisedLink to="/guilds">View guild rankings</StylisedLink>
      </div>
    </main>
  );
}
