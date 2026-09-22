import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { StylisedLink } from '~/components/StylisedLink';
import {
  cardStyle,
  errorCardStyle,
  textTitleStyle,
  textTitle2Style,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

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
    <main className="pt-30 pb-10 px-4 min-h-dvh w-full flex flex-col items-center">
      <h1 className={twMerge(textTitleStyle, 'uppercase mb-5')}>My Guild</h1>

      <div className="w-full max-w-5xl flex flex-col gap-4">
        <GuildInvitations invitations={invitations} error={invitationError} />

        <section className={cardStyle}>
          <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
            Create a guild
          </h2>

          <Form method="post" className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="_intent" value="create-guild" />

            {/*
              These rules mirror GuildNameDto in
              backend/src/guilds/dto/guild-name.dto.ts. Keep them in sync:
              the backend is what actually enforces them.
            */}
            <Input
              variant="textarea"
              className="flex-1 text-base"
              id="guild-name"
              name="name"
              type="text"
              placeholder="Guild name"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9 _\-]+"
              title="Letters, numbers, spaces, underscores and hyphens only."
              disabled={isCreating}
            >
              Guild name
            </Input>

            <Button type="submit" disabled={isCreating} className="px-6 py-2">
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </Form>

          {creationError && (
            <p className={twMerge(errorCardStyle, 'mt-4')}>{creationError}</p>
          )}
        </section>

        <StylisedLink to="/guilds">View guild rankings</StylisedLink>
      </div>
    </main>
  );
}
