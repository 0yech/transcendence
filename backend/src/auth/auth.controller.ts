import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO Replace Record<string, string> with a DTO class to validate the body in a pipe
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, string>) {
    console.log(signInDto);
    return this.authService.signIn(signInDto.username, signInDto.password);
  }
}
