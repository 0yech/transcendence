import { Form, Link, useNavigation } from 'react-router';

interface GuildCreationProps {
  error?: string;
}

export function GuildCreation({
  error,
}: GuildCreationProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <main>
      <h1>My Guild</h1>
      <p>You are not currently in a guild.</p>
      <section>
        <h2>Create a guild</h2>
        <Form method="post">
          <div>
            <label htmlFor="guild-name">
              Guild name
            </label>

            <input
              id="guild-name"
              name="name"
              type="text"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Creating...'
              : 'Create guild'}
          </button>
        </Form>

        {error && <p>{error}</p>}
      </section>

      <nav>
        <Link to="/guilds">
          View guild rankings
        </Link>
      </nav>
    </main>
  );
}