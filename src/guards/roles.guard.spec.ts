import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard (Finanx-aligned)', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext({ role: { label: 'user' } });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when requiredRoles is empty array', () => {
      reflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext({ role: { label: 'user' } });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has matching role via Finanx role.label (case insensitive)', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);
      const context = createMockContext({ role: { label: 'ADMIN' } });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has matching simple role string (case insensitive)', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);
      const context = createMockContext({ role: 'ADMIN' });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has matching role in roles array', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin', 'moderator']);
      const context = createMockContext({ roles: ['viewer', 'moderator'] });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when user role does not match', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({ role: { label: 'user' } });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        "You're not authorized to perform this action",
      );
    });

    it('should throw ForbiddenException when user has null role', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({ role: null });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user object has no role property', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({});

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when role label is empty string', () => {
      reflector.getAllAndOverride.mockReturnValue(['admin']);
      const context = createMockContext({ role: { label: '' } });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle mixed case role labels', () => {
      reflector.getAllAndOverride.mockReturnValue(['Admin', 'USER']);
      const context = createMockContext({ role: { label: 'admin' } });

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
