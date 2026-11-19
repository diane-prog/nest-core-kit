import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  QueryFailedError,
  EntityNotFoundError,
  EntityMetadataNotFoundError,
  EntityPropertyNotFoundError,
  CannotCreateEntityIdMapError,
  DataTypeNotSupportedError,
  TypeORMError,
} from 'typeorm';

/**
 * Filtre global : uniformise toutes les réponses d'erreur de l'API.
 * Gère les HttpException de NestJS, les erreurs TypeORM (requêtes, contraintes, entités non trouvées),
 * ainsi que les erreurs inattendues de façon robuste (aligné sur l'architecture Finanx).
 *
 * Enregistrement global recommandé (dans main.ts) :
 *   app.useGlobalFilters(new HttpExceptionFilter());
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Erreur interne du serveur.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message;
    } else if (exception instanceof TypeORMError) {
      status = this.mapTypeORMErrorToHttpStatus(exception);
      // Récupère les détails de violation (ex: unicité Postgres/MySQL) si disponible
      const detail = (exception as any).detail;
      message = detail || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
    });
  }

  /**
   * Mappe les erreurs internes TypeORM vers des statuts HTTP appropriés (400, 404, etc.)
   */
  private mapTypeORMErrorToHttpStatus(error: TypeORMError): HttpStatus {
    switch (true) {
      case error instanceof QueryFailedError:
      case error instanceof CannotCreateEntityIdMapError:
      case error instanceof DataTypeNotSupportedError:
        return HttpStatus.BAD_REQUEST;
      case error instanceof EntityNotFoundError:
      case error instanceof EntityMetadataNotFoundError:
      case error instanceof EntityPropertyNotFoundError:
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
