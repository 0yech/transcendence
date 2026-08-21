import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import type { CookieOptions, Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { OauthPayload } from './oauth-payload.interface';
import { UpdateDto } from './dto/update.dto';
import * as bcrypt from 'bcrypt';
import { OAuthProvider } from 'src/generated/prisma/enums';
import { OauthCallbackFilter } from './oauth-callback.filter';
import { OAuthError } from './oauth-error.enum';
import { OAuthException } from './oauth.exception';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * @brief Creates a user on the database.
   */
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    await this.usersService.createOne(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
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
    response.cookie('access_token', accessToken, cookieOptions);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: '/api/auth',
    });
  }

  /**
   * @brief Creates a new session after OAuth authentication. Then, redirects to
   * profile if everything went well, or to the registration page if it failed.
   */
  async oauthSession(
    provider: OAuthProvider,
    userData: OauthPayload,
    response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signInOauth(
      provider,
      userData,
    );

    response.cookie('access_token', accessToken, cookieOptions);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: '/api/auth',
    });
    response.redirect(`${process.env.FRONTEND_ORIGIN}profile`);
  }

  /**
   * @brief This route will redirect the user to the google login screen.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  /**
   * @brief This route will be hit after logging in on user.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = req.user as OauthPayload; // stashed user information from guards
    if (!userData) {
      throw new OAuthException(OAuthError.MISSING_DATA);
    }

    await this.oauthSession('GOOGLE', userData, response);
  }

  /**
   * @brief This route will redirect the user to the google login screen.
   */
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  /**
   * @brief This route will be hit after logging in on user.
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = req.user as OauthPayload; // stashed user information from guards
    if (!userData) {
      throw new OAuthException(OAuthError.MISSING_DATA);
    }

    await this.oauthSession('GITHUB', userData, response);
  }

  /**
   * @brief This route will redirect the user to the google login screen.
   */
  @Get('fortytwo')
  @UseGuards(AuthGuard('fortytwo'))
  async fortytwoAuth() {}

  /**
   * @brief This route will be hit after logging in on user.
   */
  @Get('fortytwo/callback')
  @UseGuards(AuthGuard('fortytwo'))
  async fortytwoAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userData = req.user as OauthPayload; // stashed user information from guards
    if (!userData) {
      throw new OAuthException(OAuthError.MISSING_DATA);
    }

    await this.oauthSession('FORTYTWO', userData, response);
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
    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: '/api/auth',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateAccount(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateDto: UpdateDto,
  ) {
    const hashedPassword = await bcrypt.hash(updateDto.password, 10);

    await this.usersService.updateOne(currentUser.sub, {
      username: updateDto.username,
      email: updateDto.email,
      pictureUrl: updateDto.pictureUrl,
      passwordHash: hashedPassword,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('remove-account')
  @UseGuards(JwtAuthGuard)
  async removeAccount(
    @Req() request: Request,
    @CurrentUser() currentUser: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersService.findOne(currentUser.sub);
    if (user === null) {
      throw new InternalServerErrorException('Current user is missing');
    }
    if (user.guildRole === 'LEADER') {
      throw new BadRequestException(
        'A guild leader cannot delete their account. \
Please delegate your role to one of your officers first!',
      );
    }
    await this.usersService.deleteOne(user.id);

    // Once account is removed, end the session
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
    response.cookie('access_token', newAccessToken, cookieOptions);
  }

  /**
   * @brief Returns the incoming request's user's public information.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: JwtPayload) {
    if (user === undefined || user.username === undefined) {
      throw new BadRequestException();
    }

    const currentUser = await this.usersService.findOnePublic(user.username);
    if (!currentUser) {
      throw new UnauthorizedException('User account was deleted.');
    }

    return currentUser;
  }
}
