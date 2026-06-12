import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @brief For a username and password, return the associate user object.
   */
  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOne(username);
    // TODO Compare hashes instead of raw passwords
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    // TODO Generate and return a JWT instead of the raw user data
    return result;
  }
}
