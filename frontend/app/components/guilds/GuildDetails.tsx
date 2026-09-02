import { Form, Link, useNavigation } from 'react-router';

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
  kickError?: string;
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
  kickError,
}: GuildDetailsProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';
  const canManageGuild =
    currentUserRole === 'LEADER' || currentUserRole === 'OFFICER';

  return (
    <main>
      <h1>{guild.name}</h1>

      <section>
        <h2>Guild information</h2>

        <dl>
          <dt>Level</dt>
          <dd>{guild.level}</dd>

          <dt>Points</dt>
          <dd>{guild.points}</dd>

          <dt>Members</dt>
          <dd>{guild._count.members}</dd>
        </dl>
      </section>

      {canManageGuild && (
        <section>
          <h2>Invite a user</h2>

          <Form method="post">
            <input type="hidden" name="_intent" value="invite-user" />

            <div>
              <label htmlFor="guild-invite-username">Username</label>

              <input
                id="guild-invite-username"
                name="username"
                type="text"
                required
              />
            </div>

            <button type="submit" disabled={isSubmitting}>
              Invite
            </button>
          </Form>

          {inviteError && (
            <p className="text-red-500 font-bold">{inviteError}</p>
          )}
          {inviteSuccess && (
            <p className="text-green-500 font-bold">{inviteSuccess}</p>
          )}
        </section>
      )}

      <section>
        <h2>Members</h2>

        {guild.members.length === 0 ? (
          <p>No members.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>

                {canManageGuild && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {guild.members.map((member) => {
                const canKick =
                  member.id !== currentUserId &&
                  canKickMember(currentUserRole, member.guildRole);

                return (
                  <tr key={member.id}>
                    <td>{member.username}</td>
                    <td>{member.guildRole}</td>

                    {canManageGuild && (
                      <td>
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
                            <button type="submit" disabled={isSubmitting}>
                              Kick
                            </button>
                          </Form>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {kickError && <p>{kickError}</p>}
      </section>

      <nav>
        <Link to="/guilds">View guild rankings</Link>
      </nav>
    </main>
  );
}
