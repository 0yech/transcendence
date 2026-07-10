import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { GuildsService } from './guilds.service';

@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  @Get()
  getGuilds() {
    return this.guildsService.getGuilds();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getMyGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.getMyGuild(user.sub);
  }

  @UseGuards(AuthGuard)
  @Post()
  createGuild(@CurrentUser() user: JwtPayload, @Body() body: { name: string }) {
    return this.guildsService.createGuild(user.sub, body.name);
  }

  @UseGuards(AuthGuard)
  @Post('leave')
  leaveGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.leaveGuild(user.sub);
  }

  @UseGuards(AuthGuard)
  @Delete()
  deleteGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.deleteGuild(user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('invitations')
  inviteUser(
    @CurrentUser() user: JwtPayload,
    @Body() body: { username: string },
  ) {
    return this.guildsService.inviteUser(user.sub, body.username);
  }

  @UseGuards(AuthGuard)
  @Get('invitations')
  getMyInvitations(@CurrentUser() user: JwtPayload) {
    return this.guildsService.getUserInvitations(user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('invitations/:invitationId/accept')
  acceptInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('invitationId') invitationId: string,
  ) {
    return this.guildsService.acceptInvitation(invitationId, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('invitations/:invitationId/decline')
  declineInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('invitationId') invitationId: string,
  ) {
    return this.guildsService.declineInvitation(invitationId, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post('members/:memberId/kick')
  kickMember(
    @CurrentUser() user: JwtPayload,
    @Param('memberId') memberId: string,
  ) {
    return this.guildsService.kickMember(user.sub, memberId);
  }
}
