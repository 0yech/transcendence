import type { Route } from './+types/guilds';
import { GuildRankingTable } from '../components/guilds/GuildRankingTable';
import { NavBar } from '~/components/Navbar';
import { cardStyle, textTitleStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import apiFetch from '~/utils/api-fetch';

export async function clientLoader() {
  const response = await apiFetch('/api/guilds');

  if (!response.ok) {
    throw new Error('Failed to fetch guilds');
  }

  return response.json();
}

export default function Guilds({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>Guild Rankings</title>
      <NavBar className="fixed"></NavBar>

      <main className="pt-30 pb-10 px-4 min-h-dvh w-full flex flex-col items-center">
        <h1 className={twMerge(textTitleStyle, 'uppercase mb-5 text-center')}>
          Guild Rankings
        </h1>

        <section className={twMerge(cardStyle, 'w-full max-w-5xl')}>
          <GuildRankingTable guilds={loaderData} />
        </section>
      </main>
    </>
  );
}
