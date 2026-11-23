import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare const BYPASS_TRANSFORM_KEY = "bypassTransform";
export declare const BypassTransform: () => import("@nestjs/common").CustomDecorator<string>;
export declare const RawResponse: () => import("@nestjs/common").CustomDecorator<string>;
export interface StandardResponse<T> {
    success: true;
    statusCode: number;
    data: T;
    timestamp: string;
}
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T> | T> {
    private readonly reflector?;
    constructor(reflector?: Reflector | undefined);
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T> | T>;
}
