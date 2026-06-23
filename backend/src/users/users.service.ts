import { Injectable } from '@nestjs/common';

// TODO Make this store users in the database instead of hard-coded here
// TODO Store passwords hashed and salted
export type User = { id: number; username: string; password: string };

@Injectable()
export class UsersService {
  private readonly users = [
    { id: 39, username: 'miku', password: 'leek' },
    { id: 401, username: 'teto', password: 'pear' },
  ];

  /**
   * @brief Find and return a user based on username
   */
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
