import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, number>();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const key = `${req.method}-${req.path}`;

    if (this.cache.has(key)) {
      return of(this.cache.get(key));
    }

    return next.handle().pipe(tap((res) => this.cache.set(key, res)));
  }
}
