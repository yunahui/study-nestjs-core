import {
  BadRequestException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ENV_KEY } from '../../common/const/env.const';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly cs: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    // 1. 헤더가 없으면 통과
    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');

    if (!bearer || bearer.toLowerCase() !== 'bearer' || !token) {
      throw new BadRequestException('올바른 토큰 형식이 아닙니다.');
    }

    const decoded = this.jwt.decode(token);

    if (!decoded || (decoded.type !== 'refresh' && decoded.type !== 'access')) {
      throw new BadRequestException('유효하지 않은 토큰 유형입니다.');
    }

    try {
      // 2. 토큰 유형 파악 (검증 전 decode)
      const isRefresh = decoded.type === 'refresh';
      const secret = this.cs.get(
        isRefresh ? ENV_KEY.REFRESH_TOKEN_SECRET : ENV_KEY.ACCESS_TOKEN_SECRET,
      );

      // 3. 실제 검증 및 Request 객체에 데이터 담기
      req['user'] = await this.jwt.verify(token, secret);

      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다.');
      }

      if (e instanceof BadRequestException) {
        throw new BadRequestException(e);
      }

      throw new UnauthorizedException('인증에 실패했습니다.');
    }
  }
}
