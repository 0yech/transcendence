import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuthException } from './oauth.exception';

/**
 * This exception filter is here to catch exceptions during the callback
 * stage of the OAuth login process. It exists because by default, the front-end
 * won't catch exceptions thrown at the callback route, since we're off of the
 * SPA at that point.
 */
@Catch()
export class OauthCallbackFilter implements ExceptionFilter {
  private readonly logger = new Logger('OauthCallbackFilter');

  catch(exception: Error, host: ArgumentsHost) {
    let errorType = undefined;
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof OAuthException) {
      errorType = exception.errorType;
    } else if (exception instanceof HttpException) {
      // Those are things that could happen and aren't a crash, like the user
      // clicking cancel on the OAuth provider's login screen
      errorType = 'unknown';
    } else {
      // Unexpected exception, Prisma errors, or something like that
      this.logger.error(
        'Unexpected exception during OAuth login: ' + exception.message,
        exception.stack,
      );
      errorType = 'unknown';
    }

    response.redirect(`${process.env.FRONTEND_ORIGIN}login?error=${errorType}`);
  }
}
