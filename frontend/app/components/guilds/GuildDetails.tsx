import { Link } from 'react-router';

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
}

export function GuildDetails({
  guild,
}: GuildDetailsProps) {
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
              </tr>
            </thead>

            <tbody>
              {guild.members.map((member) => (
                <tr key={member.id}>
                  <td>{member.username}</td>
                  <td>{member.guildRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <nav>
        <Link to="/guilds">
          View guild rankings
        </Link>
      </nav>
    </main>
  );
}