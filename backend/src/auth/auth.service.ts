import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * @brief Return a JWT for a valid username and password.
   * The JWT will contain the user's ID and username.
   */
  async signIn(
    username: string,
    pass: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(username);
    // TODO Compare hashes instead of raw passwords
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }

    // sub is conventional in JWT, and means "subject"
    // in this case, it's the user's id
    const payload = { sub: user.id, username: user.username };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
