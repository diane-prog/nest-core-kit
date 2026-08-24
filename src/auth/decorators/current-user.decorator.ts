import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injecte l'utilisateur authentifié (attaché par JwtAuthGuard) dans le handler.
 *
 * Exemple :
 *   @Get('me')
 *   getProfile(@CurrentUser() user: RequestUser) {
 *     return user;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
