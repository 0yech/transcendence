import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';
import { OauthPayload } from './oauth-payload.interface';

const SESSION_LIFETIME_MS = 1000 * 60 * 60 * 24 * 14; // Two weeks

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
  public readonly user: string;
  public readonly startDate = new Date();

  constructor(user: string) {
    this.user = user;
  }

  isExpired(): boolean {
    const now = Date.now();
    const timeElapsedMs = now - this.startDate.getTime();
    return timeElapsedMs > SESSION_LIFETIME_MS;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Map of refresh token to session
  private readonly sessions: Map<string, AuthSession> = new Map();

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
    const user = await this.usersService.findOneUsername(username);

    if (user === null) {
      throw new UnauthorizedException("User doesn't exist.");
    }

    if (user.hashedPassword === null) {
      throw new UnauthorizedException(
        'Please login using your Oauth provider.',
      );
    }
    const match = await bcrypt.compare(password, user.hashedPassword);
    if (!match) {
      throw new UnauthorizedException("Password doesn't match.");
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
   * @brief Sign in using data returned from an Oauth provider.
   * Since the provider already checked for credentials for us, we act as if
   * they had already logged in, either returning a token directly, or registering
   * a new user.
   */
  async signInOauth(
    userData: OauthPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let username = userData.username;
    const { email, pictureUrl } = userData;

    let user = await this.usersService.findOneEmail(email);

    if (user === null) {
      if (!username) {
        username = await this.usersService.createUsername(email);
      }
      user = await this.usersService.createOne(username, email);
      if (pictureUrl) {
        await this.usersService.updateOne(user.id, {
          pictureUrl: pictureUrl,
        });
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
   * If the session has been alive for more than two weeks, kill it. The user
   * will need to log in again.
   *
   * @throws UnauthorizedException whenever a session is expired, doesn't exist,
   * or the user is missing.
   */
  async refresh(refreshToken: string) {
    const session = this.sessions.get(refreshToken);
    if (session === undefined) throw new UnauthorizedException();

    if (session.isExpired()) {
      this.sessions.delete(refreshToken);
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findOneUsername(session.user);
    if (user === null) throw new UnauthorizedException();

    return this.issueNewAccessToken(user);
  }

  /**
   * @brief Every hour, goes through all active sessions, and kills expired ones.
   */
  @Cron('* 0 * * * *')
  async cleanupSessions() {
    this.sessions.forEach((session, refreshToken) => {
      if (session.isExpired()) {
        this.sessions.delete(refreshToken);
      }
    });
  }
}
