import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../guards/jwt-auth.guard';

/**
 * Marque une route comme publique, ignorée par JwtAuthGuard.
 *
 * Exemple :
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
