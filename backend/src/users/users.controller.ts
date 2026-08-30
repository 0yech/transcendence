import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';

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
}
