import { TransformFnParams } from 'class-transformer';

/**
 * @brief Trims a DTO field, for use with `@Transform()`.
 *
 * Only strings are trimmed. Anything else is passed through unchanged for
 * `@IsString()` to reject: calling `trim()` on it would throw, and the client
 * would get a 500 instead of a 400.
 */
export function trimIfString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}
