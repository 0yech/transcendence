import { cardDarkStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import type { Guild } from './GuildDetails';
import { useMemo, useState } from 'react';

/* Table styles, shared by every table of the site. */
const thStyle =
  'px-5 py-4 text-sm font-bold uppercase tracking-wider text-light-pink';
const tdStyle = 'border-t border-gray px-5 py-4';

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
    <div className={twMerge(cardDarkStyle, 'p-0 overflow-x-auto')}>
      <table className="w-full min-w-150 text-left">
        <thead>
          <tr>
            <th className={thStyle}>Rank</th>
            <th
              className={twMerge(
                thStyle,
                'cursor-pointer select-none hover:text-pink',
              )}
              onClick={() => handleSort('name')}
            >
              Guild{renderSortIcon('name')}
            </th>
            <th
              className={twMerge(
                thStyle,
                'cursor-pointer select-none hover:text-pink',
              )}
              onClick={() => handleSort('members')}
            >
              Members{renderSortIcon('members')}
            </th>
            <th
              className={twMerge(
                thStyle,
                'text-right cursor-pointer select-none hover:text-pink',
              )}
              onClick={() => handleSort('points')}
            >
              Points{renderSortIcon('points')}
            </th>
            <th
              className={twMerge(
                thStyle,
                'text-right cursor-pointer select-none hover:text-pink',
              )}
              onClick={() => handleSort('avgElo')}
            >
              Elo{renderSortIcon('avgElo')}
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedGuilds.map((guild) => (
            <tr key={guild.id} className="transition-colors hover:bg-pink/10">
              <td className={twMerge(tdStyle, 'font-black text-pink')}>
                #{guild.defaultRank}
              </td>
              <td className={twMerge(tdStyle, 'text-xl font-bold')}>
                {guild.name}
              </td>
              <td className={tdStyle}>{guild._count.members}</td>
              <td
                className={twMerge(
                  tdStyle,
                  'text-right text-xl font-black text-blue',
                )}
              >
                {guild.points}
              </td>
              <td
                className={twMerge(
                  tdStyle,
                  'text-right text-xl font-black text-pink',
                )}
              >
                {guild.avgElo.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
