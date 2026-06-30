import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * @brief Creates a user and returns a logged in JWT for that new user.
   */
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: Record<string, string>) {
    const newUser = await this.usersService.createOne(
      registerDto.username,
      registerDto.password,
    );

    if (newUser === undefined) {
      throw new ConflictException();
    }
  }

  // TODO Replace Record<string, string> with a DTO class to validate the body in a pipe
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, string>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  /**
   * @brief Returns the incoming request's JWT's payload, defined in the AuthService.
   */
  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() user: JwtPayload) {
    // TODO Remove password from returned User object
    return this.usersService.findOne(user.username);
  }
}
