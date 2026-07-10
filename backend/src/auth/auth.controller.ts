import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.usersService.createOne(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );

    if (newUser === undefined) {
      throw new ConflictException();
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }

  /**
   * @brief This endpoint removes the session attached to a given refresh token.
   */
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    await this.authService.signOut(refreshToken);
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/auth',
    });
  }

  /**
   * @brief This endpoints aims to refresh an access token once it has expired.
   * To that end, the refresh token is used, which holds the username of the
   * user that has the session attached to the refresh token.
   */
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    const newAccessToken = await this.authService.refresh(refreshToken);
    response.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }

  /**
   * @brief Returns the incoming request's JWT's payload, defined in the AuthService.
   */
  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() user: JwtPayload) {
    if (user === undefined || user.username === undefined) {
      throw new BadRequestException();
    }
    // TODO Remove password from returned User object
    return this.usersService.findOne(user.username);
  }
}
