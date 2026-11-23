"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Erreur interne du serveur.';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'object' &&
                    exceptionResponse !== null &&
                    'message' in exceptionResponse
                    ? exceptionResponse.message
                    : exception.message;
        }
        else if (exception instanceof typeorm_1.TypeORMError) {
            status = this.mapTypeORMErrorToHttpStatus(exception);
            const detail = exception.detail;
            message = detail || exception.message;
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.url} - ${status}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`${request.method} ${request.url} - ${status}: ${JSON.stringify(message)}`);
        }
        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            timestamp: new Date().toISOString(),
            message,
        });
    }
    mapTypeORMErrorToHttpStatus(error) {
        switch (true) {
            case error instanceof typeorm_1.QueryFailedError:
            case error instanceof typeorm_1.CannotCreateEntityIdMapError:
            case error instanceof typeorm_1.DataTypeNotSupportedError:
                return common_1.HttpStatus.BAD_REQUEST;
            case error instanceof typeorm_1.EntityNotFoundError:
            case error instanceof typeorm_1.EntityMetadataNotFoundError:
            case error instanceof typeorm_1.EntityPropertyNotFoundError:
                return common_1.HttpStatus.NOT_FOUND;
            default:
                return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map