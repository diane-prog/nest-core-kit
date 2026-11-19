import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import {
  ResponseTransformInterceptor,
  BYPASS_TRANSFORM_KEY,
} from './response-transform.interceptor';

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<any>;
  let reflector: jest.Mocked<Reflector>;
  let mockContext: ExecutionContext;
  let mockNext: CallHandler;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    interceptor = new ResponseTransformInterceptor(reflector);

    mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    mockNext = {
      handle: () => of({ id: '123', name: 'Test' }),
    };
  });

  it('should wrap standard responses in { success: true, statusCode, data, timestamp }', (done) => {
    reflector.getAllAndOverride.mockReturnValue(false);

    interceptor.intercept(mockContext, mockNext).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual({ id: '123', name: 'Test' });
      expect(result.timestamp).toBeDefined();
      done();
    });
  });

  it('should bypass response envelope when @BypassTransform() is present', (done) => {
    reflector.getAllAndOverride.mockReturnValue(true);

    interceptor.intercept(mockContext, mockNext).subscribe((result: any) => {
      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(result.success).toBeUndefined();
      done();
    });
  });
});
