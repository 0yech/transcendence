import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  sessions: Map<string, string> = new Map();

  /**
   * @brief Return a JWT for a valid username and password.
   * The JWT will contain the user's ID and username.
   */
  async signIn(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOne(username);

    if (user === null) {
      throw new UnauthorizedException("User doesn't exist.");
    }

    if (user.hashedPassword !== null) {
      const match = await bcrypt.compare(password, user.hashedPassword);
      if (!match) {
        throw new UnauthorizedException("Password doesn't match.");
      }
    }

    // sub is conventional in JWT, and means "subject"
    // in this case, it's the user's id
    const accessTokenPayload = { sub: user.id, username: user.username };
    const refreshToken = crypto.randomUUID();

    this.sessions.set(refreshToken, user.id);

    return {
      accessToken: await this.jwtService.signAsync(accessTokenPayload),
      refreshToken: refreshToken,
    };
  }

  /**
   * @brief This function removes a currently active session from the session list.
   */
  async signOut(refreshToken: string) {
    this.sessions.delete(refreshToken);
  }
}
