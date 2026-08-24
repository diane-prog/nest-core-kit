import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Stratégie JWT générique. Le projet consommateur doit fournir
 * JWT_SECRET dans ses variables d'environnement.
 *
 * À enregistrer dans un module :
 *   providers: [JwtStrategy]
 *
 * Le retour de validate() devient `request.user`, donc récupérable
 * via @CurrentUser().
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-env',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
