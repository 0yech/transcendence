import { Form, Link, useNavigation } from 'react-router';

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
    <main>
      <h1>My Guild</h1>

      <p>You are not currently in a guild.</p>

      <GuildInvitations invitations={invitations} error={invitationError} />

      <section>
        <h2>Create a guild</h2>

        <Form method="post">
          <input type="hidden" name="_intent" value="create-guild" />

          <div>
            <label htmlFor="guild-name">Guild name</label>

            <input
              id="guild-name"
              name="name"
              type="text"
              required
              disabled={isCreating}
            />
          </div>

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create guild'}
          </button>
        </Form>

        {creationError && <p>{creationError}</p>}
      </section>

      <nav>
        <Link to="/guilds">View guild rankings</Link>
      </nav>
    </main>
  );
}
