import { NavBar } from '~/components/Navbar';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import type { Route } from './+types/settings';
import apiFetch from '~/utils/api-fetch';
import { Form, redirect } from 'react-router';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { ErrorMessage } from '~/pages/auth/errorMessage';

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

  return (
    <>
      <title>Account settings</title>
      <NavBar className="fixed" />
      <main className="min-h-dvh px-4 pb-10 pt-28 sm:px-8">
        <section className="mx-auto w-full max-w-xl rounded-4xl bg-dark-blue/30 p-6 shadow-2xl shadow-dark-blue sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink">
            Account
          </p>
          <h1 className="mt-1 text-4xl font-black">Settings</h1>
          <Form
            className="flex flex-col items-center pt-8 gap-3"
            method="POST"
            encType="multipart/form-data"
          >
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

            <Input
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/jpg"
              id="file"
              placeholder="Select an image"
              labelClassName=""
            >
              Avatar
            </Input>

            <Button
              className="text-3xl w-80"
              variant="accept"
              type="submit"
              name="_intent"
              value="update-settings"
            >
              save
            </Button>
            <Button
              className="text-3xl w-80"
              variant="danger"
              type="submit"
              name="_intent"
              value="delete-account"
            >
              delete account
            </Button>
          </Form>
          <ErrorMessage message={actionData?.error ? actionData.error : ''} />
          {actionData?.success ? (
            <p className="mt-5 rounded-2xl bg-accept/15 px-4 py-3 text-accept">
              {actionData.success}
            </p>
          ) : null}
        </section>
      </main>
    </>
  );
}
