interface Guild {
  id: string;
  name: string;
  level: number;
  points: number;
  _count: {
    members: number;
  };
}

interface Props {
  guilds: Guild[];
}

export function GuildRankingTable({ guilds }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Guild</th>
          <th>Level</th>
          <th>Members</th>
          <th>Points</th>
        </tr>
      </thead>

      <tbody>
        {guilds.map((guild, index) => (
          <tr key={guild.id}>
            <td>{index + 1}</td>
            <td>{guild.name}</td>
            <td>{guild.level}</td>
            <td>{guild._count.members}</td>
            <td>{guild.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
