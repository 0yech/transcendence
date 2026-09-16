import { Form, Link, useNavigation } from 'react-router';
import { Avatar } from '~/components/Avatar';
import { Button, ButtonLinkIn } from '~/components/Button';
import {
  accentPillClass,
  insetCardClass,
  primaryCardClass,
} from '~/styles/theme';

import type { Friend } from '~/utils/friends';

interface FriendListProps {
  friends: Friend[];
  error?: string;
}

/**
 * @brief Displays the authenticated user's friends.
 *
 * Each friend sitting in an active lobby gets a button leading to that
 * lobby, so the user can follow them into a game.
 *
 * @param friends The friends to display.
 * @param error An optional error returned by a friend action.
 * @return The friend list.
 */
export function FriendList({ friends, error }: FriendListProps) {
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <section className={primaryCardClass}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-3xl font-black sm:text-4xl">Friends</h2>
        <span className={accentPillClass}>{friends.length}</span>
      </div>

      {friends.length === 0 ? (
        <p className="mt-4 opacity-60">
          You have no friends yet. Invite someone by their username.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {friends.map((friend) => {
            const lobby = friend.lobby;
            const isJoinable = lobby !== null && lobby.active;

            return (
              <li
                key={friend.id}
                className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${insetCardClass}`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Link to={`/profile/byUser/${friend.username}`}>
                    <Avatar
                      className="h-14 w-14 transition-transform duration-300 hover:scale-110"
                      src={friend.avatarUrl}
                      alt={friend.username}
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      to={`/profile/byUser/${friend.username}`}
                      className="truncate text-2xl font-black hover:text-pink hover:underline hover:decoration-pink"
                    >
                      {friend.username}
                    </Link>
                    <p className="mt-1 text-light-gray">
                      {friend.guild ? friend.guild.name : 'No guild'}
                      <span className="mx-2 opacity-40">|</span>
                      <span className="font-bold text-pink">
                        {friend.totalPts} pts
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
                    <span className="italic opacity-60">Not in a lobby</span>
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

      {error && <p className="mt-4 font-bold text-danger">{error}</p>}
    </section>
  );
}
