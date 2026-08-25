import { Injectable } from '@nestjs/common';
import { OauthPayload } from './oauth-payload.interface';
import { PassportStrategy } from '@nestjs/passport';
import fortytwoStrategy from 'passport-42'; // Default import because of CJS module
import passport from 'passport';
import { OAuthError } from './oauth-error.enum';
import { OAuthException } from './oauth.exception';

@Injectable()
export class FortytwoStrategy extends PassportStrategy(
  fortytwoStrategy,
  'fortytwo',
) {
  constructor() {
    if (
      !process.env.FORTYTWO_CLIENT_ID ||
      !process.env.FORTYTWO_CLIENT_SECRET
    ) {
      throw Error('Missing environment variable for 42 Oauth.');
    }

    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: `${process.env.FRONTEND_ORIGIN}api/auth/fortytwo/callback`,
      // Define our own profile fields to overwrite the wonky ones from the 42 library
      profileFields: {
        id: function (obj) {
          return String(obj.id);
        },
        username: 'login',
        displayName: 'displayname',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        profileUrl: 'url',
        'emails.0.value': 'email',
        'phoneNumbers.0.value': 'phone',
        'photos.0.value': 'image.link',
      },
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: passport.Profile,
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
      email: emails[0].value,
      pictureUrl: photos[0].value,
    };
    return user;
  }
}
