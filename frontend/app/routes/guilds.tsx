import type { Route } from './+types/guilds';
import { GuildRankingTable } from '../components/guilds/GuildRankingTable';
import { NavBar } from '~/components/Navbar';

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
      <NavBar></NavBar>

      <h1>Guild Rankings</h1>

      <GuildRankingTable guilds={loaderData} />
    </>
  );
}
