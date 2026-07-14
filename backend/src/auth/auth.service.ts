import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

/**
 * @brief Represents a session currently active for a given user in the AuthService
 * service.
 * Class instances will be used in the `sessions` map of the AuthService, mapped
 * by refresh token.
 *
 * @description Holds the start date of the sessions, so that it can be made to
 * expire after two weeks, past which you can't refresh your access token.
 */
class AuthSession {
  constructor(public user: string) {
    this.user = user;
    this.startDate = new Date();

    console.log('Created new session for user', this.user, this.startDate);
  }

  public startDate: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Map of refresh token to username
  sessions: Map<string, AuthSession> = new Map();

  /**
   * @brief For a given user, issue a new access token.
   */
  issueNewAccessToken(user: { id: string; username: string }): Promise<string> {
    // sub is conventional in JWT, and means "subject"
    // in this case, it's the user's id
    const accessTokenPayload = { sub: user.id, username: user.username };
    return this.jwtService.signAsync(accessTokenPayload);
  }

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

    const accessToken = await this.issueNewAccessToken(user);
    const refreshToken = crypto.randomUUID();

    this.sessions.set(refreshToken, new AuthSession(user.username));

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * @brief This function removes a currently active session from the session list.
   */
  async signOut(refreshToken: string) {
    this.sessions.delete(refreshToken);
  }

  /**
   * @brief Issue a new access token for the session a given refresh token refers to.
   */
  async refresh(refreshToken: string) {
    const session = this.sessions.get(refreshToken);
    if (session === undefined) throw new UnauthorizedException();
    const user = await this.usersService.findOne(session.user);
    if (user === null) throw new UnauthorizedException();
    return this.issueNewAccessToken(user);
  }
}
