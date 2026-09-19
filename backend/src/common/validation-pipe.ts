import { ValidationPipe } from '@nestjs/common';

/**
 * @brief Builds the pipe that validates every incoming request.
 *
 * Both `main.ts` and the tests use this, so a test can never pass against
 * settings the running server doesn't have.
 */
export function buildValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // Transform data types into the ones present in the DTO class
  });
}
