import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import { Input } from '~/components/Input';
import { cardStyle, errorCardStyle, textTitle2Style } from '~/styles/style';
import { twMerge } from 'tailwind-merge';

interface AddFriendProps {
  error?: string;
  success?: string;
}

/**
 * @brief Displays the form used to invite another user as a friend.
 *
 * @param error An optional error returned by the invite action.
 * @param success An optional confirmation returned by the invite action.
 * @return The add friend form.
 */
export function AddFriend({ error, success }: AddFriendProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className={cardStyle}>
      <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
        Add a friend
      </h2>

      <Form method="post" className="flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="_intent" value="invite-friend" />

        {/*
          Deliberately no length or character rules: this looks up an
          existing username, and those aren't consistently bounded. A rule
          here would block sending invitations to accounts whose names
          predate it, or that OAuth created.
        */}
        <Input
          variant="textarea"
          className="flex-1 text-base"
          id="friend-invite-username"
          name="username"
          type="text"
          placeholder="Username"
          autoComplete="off"
          required
        >
          Username
        </Input>

        <Button type="submit" disabled={isSubmitting} className="px-6 py-2">
          Invite
        </Button>
      </Form>

      {error && <p className={twMerge(errorCardStyle, 'mt-4')}>{error}</p>}
      {success && (
        <p className="mt-4 rounded-xl border border-accept bg-accept/20 p-2 text-accept">
          {success}
        </p>
      )}
    </section>
  );
}
