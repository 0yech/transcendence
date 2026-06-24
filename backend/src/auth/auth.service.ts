import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * @brief Return a JWT for a valid username and password.
   * The JWT will contain the user's ID and email.
   */
  async signIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(email);

    if (user === undefined) {
      throw new UnauthorizedException("User doesn't exist.");
    }

    if (user.passwordHash !== undefined) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        throw new UnauthorizedException("Password doesn't match.");
      }
    }

    // TODO Remove personal data (email) from JWT
    // sub is conventional in JWT, and means "subject"
    // in this case, it's the user's id
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
