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
    const token = request.cookies['access_token'];

    // No token = not logged in.
    if (!token) {
      request['user'] = undefined;
      return true;
    }

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch {
      // A token exists but is invalid/expired:
      // keep the 401 so apiFetch can try /auth/refresh.
      throw new UnauthorizedException();
    }

    return true;
  }
}
