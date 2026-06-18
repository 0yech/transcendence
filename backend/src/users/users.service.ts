import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// TODO Make this store users in the database instead of hard-coded here
export type User = { id: number; username: string; password?: string };

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
   * @return The newly created User object, as a Promise.
   */
  async createOne(username: string, password: string): Promise<User> {
    if (this.users.find((value) => value.username === username) !== undefined) {
      throw new ConflictException();
    }

    const lastUser = this.users.at(-1);
    // TODO Have a better logic for creating user ids
    const id = lastUser === undefined ? 1 : lastUser.id + 1;

    // Hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const user: User = {
      id: id,
      username: username,
      password: hash,
    };
    this.users.push(user);
    return user;
  }
}
