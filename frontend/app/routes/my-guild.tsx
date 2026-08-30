import { redirect } from 'react-router';

import apiFetch from '~/utils/api-fetch';
import { GuildDetails, type Guild } from '~/components/guilds/GuildDetails';
import { GuildCreation } from '~/components/guilds/GuildCreation';
import type { Route } from './+types/my-guild';

export async function clientLoader(): Promise<Guild | null> {
  const response = await apiFetch('/api/guilds/me');

  if (!response.ok) {
    throw new Error('Failed to fetch guild');
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as Guild;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = formData.get('name');

  if (typeof name !== 'string' || !name.trim()) {
    return {
      error: 'Guild name is required',
    };
  }

  const response = await apiFetch('/api/guilds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name.trim(),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    return {
      error: data?.message ?? 'Failed to create guild',
    };
  }

  return redirect('/guilds/me');
}

export default function MyGuild({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const guild = loaderData;

  if (!guild) {
    return (
      <>
        <title>My Guild</title>

        <GuildCreation error={actionData?.error} />
      </>
    );
  }

  return (
    <>
      <title>{guild.name}</title>

      <GuildDetails guild={guild} />
    </>
  );
}
