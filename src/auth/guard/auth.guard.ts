import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. @Public() 데코레이터 확인
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    // 2. 미들웨어에서 넣어준 user 객체 확인
    const user = req.user;

    // 3. 조건: 유저 정보가 존재해야 하며, 반드시 'access' 토큰이어야 함
    if (user && user.type === 'access') {
      return true;
    }

    // 4. 통과하지 못한 경우 (403 Forbidden)
    return false;
  }
}
