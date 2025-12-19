import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    if (!req || !req.qr) {
      throw new InternalServerErrorException('Query runner does not exist');
    }

    return req.qr;
  },
);
