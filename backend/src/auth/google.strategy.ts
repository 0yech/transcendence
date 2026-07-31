import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { OauthPayload } from './oauth-payload.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw Error('Missing environment variable for google Oauth.');
    }

    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_ORIGIN}api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<OauthPayload> {
    const { emails, photos } = profile;
    if (!emails || !photos) {
      throw new Error('Missing information in Google profile');
    }
    const user = {
      email: emails[0].value,
      pictureUrl: photos[0].value,
    };
    return user;
  }
}
