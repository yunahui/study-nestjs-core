import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
} from '@nestjs/common';

@Catch(ForbiddenException)
export class ForbiddennException implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const status = exception.getStatus();

    console.log(`[UnauthorizedException] ${req.method} ${req.path}`);

    res.status(status).json({
      statusCode: status,
      timestampe: new Date().toISOString(),
      path: req.url,
      message: '권한이 없습니다.',
    });
  }
}
