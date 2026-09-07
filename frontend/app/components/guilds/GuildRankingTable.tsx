import { tableContainerClass } from '~/styles/theme';

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
    <div className={tableContainerClass}>
      <table className="w-full min-w-150 border-separate border-spacing-0 text-left">
        <thead className="text-sm uppercase tracking-wider text-light-pink">
          <tr>
            <th className="px-5 py-4">Rank</th>
            <th className="px-5 py-4">Guild</th>
            <th className="px-5 py-4">Level</th>
            <th className="px-5 py-4">Members</th>
            <th className="px-5 py-4 text-right">Points</th>
          </tr>
        </thead>

        <tbody>
          {guilds.map((guild, index) => (
            <tr
              key={guild.id}
              className="border-t border-light-pink/10 transition-colors hover:bg-pink/10"
            >
              <td className="border-t border-light-pink/10 px-5 py-4 font-black text-pink">
                #{index + 1}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4 text-xl font-bold">
                {guild.name}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4">
                {guild.level}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4">
                {guild._count.members}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4 text-right text-xl font-black text-pink">
                {guild.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
