import { Form, Link, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import {
  accentLinkClass,
  accentPillClass,
  eyebrowClass,
  insetCardClass,
  pageContentClass,
  pageShellClass,
  primaryCardClass,
  tableContainerClass,
  textInputClass,
} from '~/styles/theme';

export interface GuildMember {
  id: string;
  username: string;
  avatarUrl: string | null;
  guildRole: 'LEADER' | 'OFFICER' | 'MEMBER' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Guild {
  id: string;
  name: string;
  level: number;
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
    <main className={pageShellClass}>
      <div className={pageContentClass}>
        <section className={primaryCardClass}>
          <p className={eyebrowClass}>Guild hall</p>
          <h1 className="mt-1 break-words text-4xl font-black sm:text-6xl">
            {guild.name}
          </h1>
          <dl className="mt-6 grid grid-cols-3 gap-3">
            <div className={`${insetCardClass} p-4`}>
              <dt className="text-xs font-bold uppercase tracking-wider text-light-pink">
                Level
              </dt>
              <dd className="mt-1 text-3xl font-black">{guild.level}</dd>
            </div>
            <div className={`${insetCardClass} p-4`}>
              <dt className="text-xs font-bold uppercase tracking-wider text-light-pink">
                Points
              </dt>
              <dd className="mt-1 text-3xl font-black text-pink">
                {guild.points}
              </dd>
            </div>
            <div className={`${insetCardClass} p-4`}>
              <dt className="text-xs font-bold uppercase tracking-wider text-light-pink">
                Members
              </dt>
              <dd className="mt-1 text-3xl font-black">
                {guild._count.members}
              </dd>
            </div>
          </dl>
        </section>

        {canManageGuild && (
          <section className={primaryCardClass}>
            <h2 className="text-3xl font-black sm:text-4xl">Invite a user</h2>

            <Form
              method="post"
              className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="_intent" value="invite-user" />

              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="guild-invite-username"
                  className="font-bold text-light-pink"
                >
                  Username
                </label>

                <input
                  id="guild-invite-username"
                  name="username"
                  type="text"
                  required
                  className={textInputClass}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3"
              >
                Invite
              </Button>
            </Form>

            {inviteError && (
              <p className="mt-4 font-bold text-danger">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="mt-4 font-bold text-accept">{inviteSuccess}</p>
            )}
          </section>
        )}

        <section className={primaryCardClass}>
          <h2 className="text-3xl font-black sm:text-4xl">Members</h2>

          {guild.members.length === 0 ? (
            <p className="mt-4 opacity-60">No members.</p>
          ) : (
            <div className={`mt-5 ${tableContainerClass}`}>
              <table className="w-full min-w-175 text-left">
                <thead className="text-sm uppercase tracking-wider text-light-pink">
                  <tr>
                    <th className="px-5 py-4">Username</th>
                    <th className="px-5 py-4">Role</th>

                    {canManageGuild && <th className="px-5 py-4">Actions</th>}
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
                        <td className="border-t border-light-pink/10 px-5 py-4 text-xl font-bold">
                          {member.username}
                        </td>
                        <td className="border-t border-light-pink/10 px-5 py-4">
                          <span className={accentPillClass}>
                            {member.guildRole}
                          </span>
                        </td>

                        {canManageGuild && (
                          <td className="border-t border-light-pink/10 px-5 py-4">
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
            <p className="mt-4 font-bold text-danger">{memberActionError}</p>
          )}
        </section>
        {/* Shows guild deletion when leader, quitting guild when member/officier
          Might want to change the alert confirm method
      */}
        <section className={primaryCardClass}>
          <h2 className="text-3xl font-black sm:text-4xl">Guild actions</h2>

          {currentUserRole === 'LEADER' ? (
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
                className="mt-5 px-6 py-3"
              >
                {isDeletingGuild ? 'Deleting...' : 'Delete guild'}
              </Button>
            </Form>
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
                  className="mt-5 px-6 py-3"
                >
                  {isLeavingGuild ? 'Leaving...' : 'Leave guild'}
                </Button>
              </Form>
            )
          )}

          {guildActionError && (
            <p className="mt-4 font-bold text-danger">{guildActionError}</p>
          )}
        </section>
        <nav>
          <Link to="/guilds" className={accentLinkClass}>
            View guild rankings
          </Link>
        </nav>
      </div>
    </main>
  );
}
