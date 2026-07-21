import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.getMyGuild(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createGuild(@CurrentUser() user: JwtPayload, @Body() body: { name: string }) {
    return this.guildsService.createGuild(user.sub, body.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leave')
  leaveGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.leaveGuild(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteGuild(@CurrentUser() user: JwtPayload) {
    return this.guildsService.deleteGuild(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations')
  inviteUser(
    @CurrentUser() user: JwtPayload,
    @Body() body: { username: string },
  ) {
    return this.guildsService.inviteUser(user.sub, body.username);
  }

  @UseGuards(JwtAuthGuard)
  @Get('invitations')
  getMyInvitations(@CurrentUser() user: JwtPayload) {
    return this.guildsService.getUserInvitations(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/:invitationId/accept')
  acceptInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('invitationId') invitationId: string,
  ) {
    return this.guildsService.acceptInvitation(invitationId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('invitations/:invitationId/decline')
  declineInvitation(
    @CurrentUser() user: JwtPayload,
    @Param('invitationId') invitationId: string,
  ) {
    return this.guildsService.declineInvitation(invitationId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('members/:memberId/kick')
  kickMember(
    @CurrentUser() user: JwtPayload,
    @Param('memberId') memberId: string,
  ) {
    return this.guildsService.kickMember(user.sub, memberId);
  }
}
