import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { JwtPayload } from 'src/auth/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('username/:username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findIdentityByUsername(username);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findIdentityById(id);
  }

  @Get('public/id/:id')
  findPublicById(@Param('id') id: string) {
    return this.usersService.findPublicIdentityById(id);
  }

  @Get('public/username/:username')
  findPublicByUser(@Param('username') username: string) {
    return this.usersService.findPublicIdentityByUser(username);
  }

  /**
   * @brief Serves a user's uploaded profile picture.
   *
   * The bytes have to go back as a StreamableFile: returning a Uint8Array
   * would be JSON-serialised into {"type":"Buffer","data":[...]} and arrive as
   * a broken image with a 200 status.
   */
  @Get('public/avatar/:id')
  async findAvatar(
    @Param('id') userId: string,
    // Express gives an array back for a repeated ?v=, so this isn't a string.
    @Query('v') version: string | string[] | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const avatar = await this.usersService.getProfilePicture(userId);

    // We serve unmodified bytes someone else uploaded, from our own origin. A
    // file can be a valid GIF and valid HTML at once, so the browser must be
    // told not to go looking for a type of its own.
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'");

    // Only the URL naming the current version may be cached forever; anything
    // else could be a stale link, and pinning that for a year is unrecoverable.
    const isCurrentVersion = version === String(avatar.updatedAt.getTime());
    response.setHeader(
      'Cache-Control',
      isCurrentVersion ? 'public, max-age=31536000, immutable' : 'no-cache',
    );

    return new StreamableFile(avatar.bytes, { type: avatar.mimeType });
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends/me')
  async getFriends(@CurrentUser() user: JwtPayload) {
    return await this.usersService.findFriends(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends/invitations/me')
  async getInvitations(@CurrentUser() user: JwtPayload) {
    return await this.usersService.findInvitations(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/invite/:userId')
  @HttpCode(HttpStatus.OK)
  async inviteFriend(
    @Param('userId') targetUserId: string,
    @CurrentUser() issuer: JwtPayload,
  ) {
    await this.usersService.inviteFriend(issuer.sub, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/remove/:userId')
  @HttpCode(HttpStatus.OK)
  async removeFriend(
    @Param('userId') targetUserId: string,
    @CurrentUser() issuer: JwtPayload,
  ) {
    await this.usersService.removeFriend(issuer.sub, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/invitations/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() issuer: JwtPayload,
  ) {
    await this.usersService.cancelInvitation(invitationId, issuer.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/invitations/:id/decline')
  @HttpCode(HttpStatus.OK)
  async declineInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() issuer: JwtPayload,
  ) {
    await this.usersService.declineInvitation(invitationId, issuer.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('friends/invitations/:id/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('id') invitationId: string,
    @CurrentUser() issuer: JwtPayload,
  ) {
    await this.usersService.acceptInvitation(invitationId, issuer.sub);
  }
}
