import { tableContainerClass } from '~/styles/theme';
import type { Guild } from './GuildDetails';
import { useMemo, useState } from 'react';

interface Props {
  guilds: Guild[];
}

export function GuildRankingTable({ guilds }: Props) {
  type SortKey = 'rank' | 'name' | 'members' | 'points' | 'avgElo';
  type SortOrder = 'asc' | 'desc';

  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const processedGuilds = useMemo(() => {
    return guilds.map((guild, index) => {
      const totalElo = guild.members.reduce(
        (sum, member) => sum + member.elo,
        0,
      );
      const avgElo =
        guild.members.length > 0 ? totalElo / guild.members.length : 0;
      return {
        ...guild,
        defaultRank: index + 1,
        avgElo,
      };
    });
  }, [guilds]);

  const sortedGuilds = useMemo(() => {
    const sorted = [...processedGuilds];

    sorted.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortKey) {
        case 'rank':
          aValue = a.defaultRank;
          bValue = b.defaultRank;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'members':
          aValue = a._count.members;
          bValue = b._count.members;
          break;
        case 'points':
          aValue = a.points;
          bValue = b.points;
          break;
        case 'avgElo':
          aValue = a.avgElo;
          bValue = b.avgElo;
          break;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [processedGuilds, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return ' ↕';
    return sortOrder === 'asc' ? ' ↑' : ' ↓ ';
  };

  return (
    <div className={tableContainerClass}>
      <table className="w-full min-w-150 border-separate border-spacing-0 text-left">
        <thead className="text-sm uppercase tracking-wider text-light-pink">
          <tr>
            <th className="px-5 py-4 cursor-pointer select-none hover:text-pink">
              Rank
            </th>
            <th
              className="px-5 py-4 cursor-pointer select-none hover:text-pink"
              onClick={() => handleSort('name')}
            >
              Guild{renderSortIcon('name')}
            </th>
            <th
              className="px-5 py-4 cursor-pointer select-none hover:text-pink"
              onClick={() => handleSort('members')}
            >
              Members{renderSortIcon('members')}
            </th>
            <th
              className="px-5 py-4 text-right cursor-pointer select-none hover:text-pink"
              onClick={() => handleSort('points')}
            >
              Points{renderSortIcon('points')}
            </th>
            <th
              className="px-5 py-4 text-right cursor-pointer select-none hover:text-pink"
              onClick={() => handleSort('avgElo')}
            >
              Average Elo{renderSortIcon('avgElo')}
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedGuilds.map((guild) => (
            <tr
              key={guild.id}
              className="border-t border-light-pink/10 transition-colors hover:bg-pink/10"
            >
              <td className="border-t border-light-pink/10 px-5 py-4 font-black text-pink">
                #{guild.defaultRank}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4 text-xl font-bold">
                {guild.name}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4">
                {guild._count.members}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4 text-right text-xl font-black text-pink">
                {guild.points}
              </td>
              <td className="border-t border-light-pink/10 px-5 py-4 text-right text-xl font-black text-pink">
                {guild.avgElo.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
