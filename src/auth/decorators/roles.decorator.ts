import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restreint l'accès à une route aux rôles listés.
 * À utiliser avec RolesGuard.
 *
 * Exemple :
 *   @Roles('admin', 'manager')
 *   @Get('reports')
 *   getReports() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
