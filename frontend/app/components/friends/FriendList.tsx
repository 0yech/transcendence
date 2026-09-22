import { Form, Link, useNavigation } from 'react-router';
import { Avatar } from '~/components/Avatar';
import { Button, ButtonLinkIn } from '~/components/Button';
import { usePresence } from '~/context/UsePresence';
import {
  cardStyle,
  cardDarkStyle,
  errorCardStyle,
  textDiscretStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

import type { Friend } from '~/utils/friends';

interface FriendListProps {
  friends: Friend[];
  error?: string;
}

/**
 * @brief Displays the authenticated user's friends.
 *
 * Each friend sitting in an active lobby gets a button leading to that
 * lobby, so the user can follow them into a game. A dot on their avatar
 * shows whether they are online.
 *
 * @param friends The friends to display.
 * @param error An optional error returned by a friend action.
 * @return The friend list.
 */
export function FriendList({ friends, error }: FriendListProps) {
  const navigation = useNavigation();
  const { isOnline } = usePresence();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className={cardStyle}>
      {friends.length === 0 ? (
        <p className={textDiscretStyle}>No friends yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {friends.map((friend) => {
            const lobby = friend.lobby;
            const isJoinable = lobby !== null && lobby.active;
            const online = isOnline(friend.id);
            const status = online ? 'Online' : 'Offline';

            return (
              <li
                key={friend.id}
                className={twMerge(
                  cardDarkStyle,
                  'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
                )}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative shrink-0">
                    <Link to={`/profile/byUser/${friend.username}`}>
                      <Avatar
                        className="h-14 w-14 transition-transform duration-300 hover:scale-110"
                        src={friend.avatarUrl}
                        alt={friend.username}
                      />
                    </Link>

                    <span
                      aria-hidden="true"
                      title={status}
                      className={twMerge(
                        'absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-dark-blue',
                        online ? 'bg-accept' : 'bg-mid-gray',
                      )}
                    />
                    <span className="sr-only">{status}</span>
                  </div>

                  <div className="min-w-0">
                    <Link
                      to={`/profile/byUser/${friend.username}`}
                      className="truncate text-2xl font-black hover:text-pink hover:underline hover:decoration-pink"
                    >
                      {friend.username}
                    </Link>
                    <p className={textDiscretStyle}>
                      {friend.guild ? friend.guild.name : 'No guild'}
                      <span className="mx-2 opacity-40">|</span>
                      <span className="font-bold text-blue">
                        {friend.totalPts} pts
                      </span>
                      <span className="mx-2 opacity-40">|</span>
                      <span className="font-bold text-gray-500">
                        {friend.elo.toFixed(0)} elo
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {isJoinable ? (
                    <ButtonLinkIn
                      to={`/game/${lobby.code}`}
                      className="px-5 text-base"
                    >
                      Join lobby ({lobby._count.users}/6)
                    </ButtonLinkIn>
                  ) : (
                    <span className={textDiscretStyle}>Not in a lobby</span>
                  )}

                  <Form
                    method="post"
                    onSubmit={(event) => {
                      const confirmed = window.confirm(
                        `Are you sure you want to remove "${friend.username}" from your friends?`,
                      );

                      if (!confirmed) event.preventDefault();
                    }}
                  >
                    <input type="hidden" name="_intent" value="remove-friend" />
                    <input type="hidden" name="userId" value={friend.id} />

                    <Button
                      variant="danger"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 text-base"
                    >
                      Remove
                    </Button>
                  </Form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className={twMerge(errorCardStyle, 'mt-4')}>{error}</p>}
    </section>
  );
}
