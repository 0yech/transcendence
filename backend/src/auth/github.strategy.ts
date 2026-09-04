import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { OauthPayload } from './oauth-payload.interface';
import { OAuthError } from './oauth-error.enum';
import { OAuthException } from './oauth.exception';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      throw Error('Missing environment variable for GITHUB Oauth.');
    }

    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_ORIGIN}api/auth/github/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OauthPayload> {
    const { emails, photos } = profile;
    if (
      !emails ||
      !emails[0] ||
      !emails[0].value ||
      !photos ||
      !photos[0] ||
      !photos[0].value
    ) {
      throw new OAuthException(OAuthError.MISSING_DATA);
    }
    const user = {
      providerId: profile.id,
      email: emails[0].value,
      pictureUrl: photos[0].value,
    };
    return user;
  }
}
