import { NavBar } from '~/components/Navbar';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import type { Route } from './+types/settings';
import apiFetch from '~/utils/api-fetch';
import { Form, redirect } from 'react-router';
import { AvatarChange, Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { ErrorMessage } from '~/pages/auth/errorMessage';
import { cardStyle, textParaStyle, textTitleStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import { Avatar } from '~/components/Avatar';
import { useState } from 'react';

interface SettingsLoaderData {
  user: SelfUserInterface;
}

interface ApiErrorBody {
  message?: string | string[];
}

export async function clientLoader(): Promise<SettingsLoaderData> {
  const response = await apiFetch('/api/auth/me');

  if (!response.ok) {
    throw new Error('Unable to load account settings.');
  }

  const user: SelfUserInterface = await response.json();

  return { user };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('_intent');

  if (intent !== 'update-settings' && intent !== 'delete-account') {
    return { error: 'Unknown settings action.' };
  }

  formData.delete('_intent');
  ['username', 'email', 'password', 'pictureUrl'].forEach((item) => {
    if (formData.get(item) === '') {
      formData.delete(item);
    }
  });

  if (intent === 'update-settings') {
    const response = await apiFetch('/api/auth/update', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => null)) as ApiErrorBody | null;
      const message = body?.message;

      return {
        error: String(
          Array.isArray(message)
            ? message.join(' ')
            : (message ?? 'Unable to save account settings.'),
        ),
      };
    }
    return { success: 'Account settings saved.' };
  } else if (intent === 'delete-account') {
    const response = await apiFetch('/api/auth/remove-account', {
      method: 'POST',
    });
    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => null)) as ApiErrorBody | null;
      const message = body?.message;

      return {
        error: String(
          Array.isArray(message)
            ? message.join(' ')
            : (message ?? 'Unable to delete the account.'),
        ),
      };
    }
    throw redirect('/');
  }
}

export default function Settings({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user } = loaderData;
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageSrc) URL.revokeObjectURL(imageSrc);

    setImageSrc(URL.createObjectURL(file));
  }

  return (
    <>
      <title>Account settings</title>
      <NavBar className="fixed" />

      <main className="pt-30 pb-10 px-4 min-h-dvh w-full flex flex-col items-center">
        <h1 className={twMerge(textTitleStyle, 'uppercase mb-5')}>Settings</h1>

        <section className={twMerge(cardStyle, 'w-full max-w-xl')}>
          <Form
            className="flex flex-col items-center gap-3"
            method="POST"
            encType="multipart/form-data"
          >
            <AvatarChange
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/jpg"
              id="file"
              onChange={handleChange}
              className="cursor-pointer"
            >
              <Avatar
                className="w-60 h-60"
                src={imageSrc ?? user.avatarUrl}
              ></Avatar>
              <div
                className={twMerge(
                  textParaStyle,
                  'text-white/0 hover:text-white hover:bg-dark-blue/60 focus-within:text-white focus-within:bg-dark-blue/60 transition-all duration-300 ease-in-out flex justify-center items-center absolute inset-0',
                )}
              >
                <span>Click to select new image</span>
              </div>
            </AvatarChange>

            <Input
              type="text"
              name="username"
              id="username"
              placeholder={user.username}
              autoComplete="username"
              labelClassName=""
            >
              Username
            </Input>

            <Input
              type="email"
              name="email"
              id="email"
              placeholder={user.email}
              autoComplete="email"
              labelClassName=""
            >
              Email
            </Input>

            <Input
              type="password"
              name="password"
              id="password"
              placeholder="New password"
              autoComplete="password"
              labelClassName=""
            >
              New password
            </Input>

            <Button
              className="text-3xl w-80"
              variant="accept"
              type="submit"
              name="_intent"
              value="update-settings"
            >
              Save
            </Button>
            <Button
              className="text-3xl w-80"
              variant="danger"
              type="submit"
              name="_intent"
              value="delete-account"
              onClick={(event) => {
                const confirmed = window.confirm(
                  'Are you sure you want to delete your account? This action cannot be undone.',
                );

                if (!confirmed) {
                  event.preventDefault();
                }
              }}
            >
              Delete account
            </Button>
          </Form>
          <ErrorMessage message={actionData?.error ? actionData.error : ''} />
          {actionData?.success ? (
            <p className="mt-5 rounded-xl border border-accept bg-accept/20 p-2 text-accept">
              {actionData.success}
            </p>
          ) : null}
        </section>
      </main>
    </>
  );
}
