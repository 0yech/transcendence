import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['access_token'];
    const refreshToken = request.cookies['refresh_token'];

    // No token = not logged in.
    if (!accessToken) {
      if (refreshToken) {
        // If the refresh token is still present, it means the user is still
        // logged in, and they should refresh their access token
        throw new UnauthorizedException();
      }
      request['user'] = undefined;
      return true;
    }

    try {
      const payload: JwtPayload =
        await this.jwtService.verifyAsync(accessToken);
      request['user'] = payload;
    } catch {
      // A token exists but is invalid/expired:
      // keep the 401 so apiFetch can try /auth/refresh.
      throw new UnauthorizedException();
    }

    return true;
  }
}
