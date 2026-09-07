import { Form, Link, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import {
  accentLinkClass,
  eyebrowClass,
  pageContentClass,
  pageShellClass,
  primaryCardClass,
  textInputClass,
} from '~/styles/theme';

import { GuildInvitations, type GuildInvitation } from './GuildInvitations';

interface GuildCreationProps {
  invitations: GuildInvitation[];
  creationError?: string;
  invitationError?: string;
}

/**
 * @brief Displays the page used when the user is not currently in a guild.
 *
 * Shows pending guild invitations and the guild creation form.
 *
 * @param invitations The pending guild invitations received by the user.
 * @param creationError An optional guild creation error.
 * @param invitationError An optional invitation action error.
 * @return The no-guild page.
 */
export function GuildCreation({
  invitations,
  creationError,
  invitationError,
}: GuildCreationProps) {
  const navigation = useNavigation();

  const isCreating =
    navigation.state === 'submitting' &&
    navigation.formData?.get('_intent') === 'create-guild';

  return (
    <main className={pageShellClass}>
      <div className={pageContentClass}>
        <section className={primaryCardClass}>
          <p className={eyebrowClass}>Guild hall</p>
          <h1 className="mt-1 text-4xl font-black sm:text-6xl">My Guild</h1>
          <p className="mt-3 opacity-70">You are not currently in a guild.</p>
        </section>

        <GuildInvitations invitations={invitations} error={invitationError} />

        <section className={primaryCardClass}>
          <h2 className="text-3xl font-black sm:text-4xl">Create a guild</h2>

          <Form
            method="post"
            className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="_intent" value="create-guild" />

            <div className="flex flex-1 flex-col gap-2">
              <label htmlFor="guild-name" className="font-bold text-light-pink">
                Guild name
              </label>

              <input
                id="guild-name"
                name="name"
                type="text"
                required
                disabled={isCreating}
                className={textInputClass}
              />
            </div>

            <Button type="submit" disabled={isCreating} className="px-6 py-3">
              {isCreating ? 'Creating...' : 'Create guild'}
            </Button>
          </Form>

          {creationError && (
            <p className="mt-4 font-bold text-danger">{creationError}</p>
          )}
        </section>

        <nav>
          <Link to="/guilds" className={accentLinkClass}>
            View guild rankings
          </Link>
        </nav>
      </div>
    </main>
  );
}
