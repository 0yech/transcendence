import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

/**
 * @brief Delivers HTTP exceptions to WebSocket clients intact.
 *
 * `ValidationPipe` throws `BadRequestException`, which is an HTTP exception.
 * The default WebSocket handler only understands `WsException` and turns
 * anything else into a bare "Internal server error", which would throw away
 * the per-field messages the DTOs carry. Re-wrapping keeps them.
 *
 * `@Catch(HttpException)` rather than `@Catch()` on purpose: unexpected
 * errors should stay generic instead of describing our internals.
 */
@Catch(HttpException)
export class WsHttpExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    super.catch(new WsException(exception.getResponse()), host);
  }
}
