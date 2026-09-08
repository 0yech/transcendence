import type { Route } from './+types/guilds';
import { GuildRankingTable } from '../components/guilds/GuildRankingTable';
import { NavBar } from '~/components/Navbar';
import { eyebrowClass, pageShellClass, primaryCardClass } from '~/styles/theme';

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

      <main className={pageShellClass}>
        <div
          className={`${primaryCardClass} mx-auto flex w-full max-w-5xl flex-col gap-5`}
        >
          <div>
            <p className={eyebrowClass}>Community</p>
            <h1 className="text-4xl font-black sm:text-6xl">Guild Rankings</h1>
            <p className="mt-2 opacity-70">
              See which guilds are leading the competition.
            </p>
          </div>

          <GuildRankingTable guilds={loaderData} />
        </div>
      </main>
    </>
  );
}
