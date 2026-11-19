import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const BYPASS_TRANSFORM_KEY = 'bypassTransform';

/**
 * Décorateur pour contourner l'enveloppe de transformation de réponse.
 * Utile pour les routes renvoyant des fichiers bruts (PDF, CSV), flux SSE, ou webhooks.
 *
 * Exemple :
 *   @BypassTransform()
 *   @Get('export/csv')
 *   exportCsv() { ... }
 */
export const BypassTransform = () => SetMetadata(BYPASS_TRANSFORM_KEY, true);

/**
 * Alias de @BypassTransform pour une sémantique explicite.
 */
export const RawResponse = BypassTransform;

export interface StandardResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Enveloppe toutes les réponses réussies dans un format standard,
 * cohérent avec le format d'erreur de HttpExceptionFilter.
 * Respecte @BypassTransform() pour les routes devant renvoyer un flux brut.
 *
 * Enregistrement global recommandé (dans main.ts) :
 *   app.useGlobalInterceptors(new ResponseTransformInterceptor(app.get(Reflector)));
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T> | T
> {
  constructor(private readonly reflector?: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T> | T> {
    if (this.reflector) {
      const bypass = this.reflector.getAllAndOverride<boolean>(
        BYPASS_TRANSFORM_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (bypass) {
        return next.handle();
      }
    }

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
