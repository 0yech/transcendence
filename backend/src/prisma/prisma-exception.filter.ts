import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

/**
 * Translates Prisma's error codes into HTTP responses, so a query that fails
 * on an ordinary condition doesn't reach the client as a 500.
 *
 * Only codes that mean "the client asked for something impossible" are
 * translated. Every other code means our own query was wrong, and a 500 is the
 * honest answer: mapping those to 4xx would blame the caller for our bug and
 * hide the fault from monitoring.
 */
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('PrismaExceptionFilter');

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    switch (exception.code) {
      // "An operation failed because it depends on one or more records that
      // were required but not found." Usually a stale id from the client, but
      // it is also what a bug on our side looks like, hence the logging below.
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Not Found';
        break;

      // Unique constraint violation.
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Conflict';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Internal Server Error';
        break;
    }

    // Prisma's own message names models, fields and constraint names, so it is
    // logged rather than returned: sending it would describe our schema to
    // anyone able to trigger an error.
    this.logger.error(
      `Prisma ${exception.code} answered as ${status}: ${exception.message}`,
      exception.stack,
    );

    response.status(status).json({ statusCode: status, message: message });
  }
}
