import { Form, useNavigation } from 'react-router';
import { Button } from '~/components/Button';
import { primaryCardClass, textInputClass } from '~/styles/theme';

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
    <section className={primaryCardClass}>
      <h2 className="text-3xl font-black sm:text-4xl">Add a friend</h2>

      <Form
        method="post"
        className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <input type="hidden" name="_intent" value="invite-friend" />

        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor="friend-invite-username"
            className="font-bold text-light-pink"
          >
            Username
          </label>
          <input
            id="friend-invite-username"
            name="username"
            type="text"
            autoComplete="off"
            required
            className={textInputClass}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="px-6 py-3">
          Send invitation
        </Button>
      </Form>

      {error && <p className="mt-4 font-bold text-danger">{error}</p>}
      {success && <p className="mt-4 font-bold text-accept">{success}</p>}
    </section>
  );
}
