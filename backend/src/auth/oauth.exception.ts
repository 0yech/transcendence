import { HttpException, HttpStatus } from '@nestjs/common';
import { OAuthError } from './oauth-error.enum';

/**
 * Represents an error that has happened during the OAuth login process.
 */
export class OAuthException extends HttpException {
  readonly errorType: OAuthError;

  constructor(errorType: OAuthError) {
    super('Error occurred during OAuth.', HttpStatus.UNAUTHORIZED);

    this.errorType = errorType;
  }
}
