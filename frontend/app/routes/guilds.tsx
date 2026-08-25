import type { Route } from './+types/guilds';
import { GuildRankingTable } from '../guilds/GuildRankingTable';

export async function clientLoader() {
  const response = await fetch('/api/guilds');

  if (!response.ok) {
    throw new Error('Failed to fetch guilds');
  }

  return response.json();
}

export default function Guilds({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>Guild Rankings</title>

      <h1>Guild Rankings</h1>

      <GuildRankingTable guilds={loaderData} />
    </>
  );
}
