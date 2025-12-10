import { Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  @Public()
  login(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  @Post('token/access')
  @Public()
  rotateAccess(@Headers('authorization') token: string) {
    return this.authService.rotateAccess(token);
  }
}
