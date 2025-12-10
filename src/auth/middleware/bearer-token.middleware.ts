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

    if (!authHeader) {
      next();
      return;
    }

    const [bearer, token] = authHeader.split(' ');

    if (!bearer || bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException();
    }

    try {
      const decoded = this.jwt.decode(token);

      if (decoded.type !== 'refresh' && decoded.type !== 'access') {
        throw new Error();
      }

      const isRefresh = decoded.type === 'refresh';

      const secret = isRefresh
        ? this.cs.get(ENV_KEY.REFRESH_TOKEN_SECRET)
        : this.cs.get(ENV_KEY.ACCESS_TOKEN_SECRET);

      req['user'] = await this.jwt.verifyAsync(token, {
        secret,
      });
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }

      throw new BadRequestException(1);
    }
  }
}
