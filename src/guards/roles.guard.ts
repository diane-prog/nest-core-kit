import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

/**
 * Guard vérifiant que l'utilisateur possède l'un des rôles requis
 * par le décorateur @Roles(...) ou @RequireRoles(...).
 *
 * Basé sur l'architecture du projet Finanx, tout en étant universel :
 *  - Supporte l'objet rôle Finanx : user.role.label (ex: { label: 'Admin' })
 *  - Supporte la chaîne simple : user.role (ex: 'Admin')
 *  - Supporte les multi-rôles : user.roles (tableau de chaînes ou d'objets)
 *  - Comparaison insensible à la casse (.toLowerCase())
 *  - Lève ForbiddenException("You're not authorized to perform this action") en cas de refus
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException("You're not authorized to perform this action");
    }

    const normalizedRequiredRoles = requiredRoles.map((r) => r.toLowerCase());
    const userRoles: string[] = [];

    // 1. Format Finanx : user.role.label
    if (user.role?.label && typeof user.role.label === 'string') {
      const label = user.role.label.trim();
      if (label) userRoles.push(label.toLowerCase());
    } 
    // 2. Format simple : user.role (string)
    else if (typeof user.role === 'string') {
      const role = user.role.trim();
      if (role) userRoles.push(role.toLowerCase());
    }

    // 3. Format tableau : user.roles
    if (Array.isArray(user.roles)) {
      for (const r of user.roles) {
        if (typeof r === 'string' && r.trim()) {
          userRoles.push(r.trim().toLowerCase());
        } else if (r?.label && typeof r.label === 'string' && r.label.trim()) {
          userRoles.push(r.label.trim().toLowerCase());
        }
      }
    }

    const hasMatchingRole = userRoles.some((role) =>
      normalizedRequiredRoles.includes(role),
    );

    if (!hasMatchingRole) {
      throw new ForbiddenException(
        "You're not authorized to perform this action",
      );
    }

    return true;
  }
}
