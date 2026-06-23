import { ConflictException, Injectable } from '@nestjs/common';

// TODO Make this store users in the database instead of hard-coded here
// TODO Store passwords hashed and salted
export type User = { id: number; username: string; password: string };

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 39, username: 'miku', password: 'leek' },
    { id: 401, username: 'teto', password: 'pear' },
  ];

  /**
   * @brief Find and return a user based on username
   */
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  /**
   * @brief Create new user in the database.
   *
   * @return The newly created User object, or undefined if it already exists.
   */
  createOne(username: string, password: string): User | undefined {
    if (this.users.find((value) => value.username === username) !== undefined) {
      throw new ConflictException();
    }

    const lastUser = this.users.at(-1);
    // TODO Have a better logic for creating user ids
    const id = lastUser === undefined ? 1 : lastUser?.id + 1;

    const user: User = {
      id: id,
      username: username,
      password: password,
    };
    this.users.push(user);
    return this.users.at(-1);
  }
}
