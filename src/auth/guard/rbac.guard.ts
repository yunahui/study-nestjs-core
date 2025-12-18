import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../decorator/rbac.decorator';
import { Role } from '../../users/entities/user.entity';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    // 1. @RBAC() 데코레이터 확인
    const role = this.reflector.get<Role>(RBAC, context.getHandler());

    // 2. 권한 설정이 없는 경우
    if (role === undefined) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // 3. 사용자 정보가 없거나 권한 비교 실패 시 차단
    if (!user) {
      return false;
    }

    // 숫자가 낮을수록 높은 권한
    return user.role <= role;
  }
}
