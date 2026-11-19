# Nest Core Kit

> Boîte à outils transversale réutilisable pour vos APIs **NestJS 11** et **TypeORM**, inspirée et alignée sur l'architecture robuste du projet **Finanx**.

Fournit un ensemble de briques prêtes à l'emploi pour standardiser vos microservices et applications backend :
- **Persistance & CRUD** : Entité de base (`UUID`, timestamps, soft delete) et Repository abstrait avec pagination intégrée.
- **Gestion des erreurs & TypeORM** : Filtre d'exception global avec conversion automatique des erreurs SQL/TypeORM en codes HTTP propres (400, 404 au lieu de 500).
- **Formatage des réponses** : Intercepteur miroir `{ success, statusCode, data, timestamp }` avec support d'exclusion brute via `@BypassTransform()`.
- **Validation avancée** : Validateur de correspondance de mot de passe `@IsPasswordMatch()`.
- **Documentation Swagger automatique** : Décorateur `@StandardPaginationQueries()` pour la pagination OpenAPI en une ligne.
- **Observabilité** : Intercepteur de logs mesurant le temps de traitement de chaque requête.
- **Sécurité & JWT** : Guard d'authentification "sécurisé par défaut", stratégie Passport JWT, gestion des rôles insensible à la casse (`RolesGuard`, `@Roles`, `@RequireRoles`), et décorateur `@CurrentUser()`.

---

## 📦 Installation

Dans votre nouveau projet NestJS :

```bash
# Via npm registry (si publié) :
pnpm add nest-core-kit

# Ou directement depuis votre dépôt Git :
pnpm add git+https://github.com/votre-compte/nest-core-kit.git
```

Dépendances requises dans le projet hôte (`peerDependencies`) :
```bash
pnpm add @nestjs/passport passport-jwt typeorm class-validator class-transformer @nestjs/swagger
```

---

## 🚀 Utilisation

### 1. Activer les filtres et intercepteurs dans `main.ts`

```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { 
  HttpExceptionFilter, 
  LoggingInterceptor, 
  ResponseTransformInterceptor 
} from 'nest-core-kit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  // Validation automatique des DTOs (whitelist + transformation)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Formatage uniforme de toutes les erreurs (HttpException, TypeORM, erreurs 500)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Logs d'exécution + formatage uniforme { success: true, data: ... }
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(reflector),
  );

  await app.listen(3000);
}
bootstrap();
```

---

### 2. Base de données & TypeORM

#### Entité
Héritez de `AbstractEntity` pour bénéficier d'un `id` (UUID), `createdAt`, `updatedAt` et `deletedAt` (soft delete) :

```typescript
import { Entity, Column } from 'typeorm';
import { AbstractEntity } from 'nest-core-kit';

@Entity('products')
export class Product extends AbstractEntity {
  @Column()
  name: string;

  @Column('decimal')
  price: number;
}
```

#### Repository avec Pagination et CRUD automatique
Héritez de `AbstractRepository<T>` :

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository, PaginateDto, PaginatedResult } from 'nest-core-kit';
import { Product } from './product.entity';

@Injectable()
export class ProductsRepository extends AbstractRepository<Product> {
  protected readonly logger = new Logger(ProductsRepository.name);

  constructor(
    @InjectRepository(Product)
    repo: Repository<Product>,
  ) {
    super(repo);
  }
}
```

Méthodes disponibles immédiatement dans votre repository :
- `create(data)`
- `findOne(where, options)` (lève une `NotFoundException` 404 automatique)
- `findOneOrNull(where, options)`
- `findAll(where)`
- `paginate(paginateDto, where)` (renvoie `{ data, meta: { total, page, limit, totalPages } }`)
- `update(where, partial)`
- `softDelete(where)` et `hardDelete(where)`

---

### 3. Contrôleur avec Pagination Swagger & Contournement de réponse

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { 
  StandardPaginationQueries, 
  PaginateDto, 
  BypassTransform 
} from 'nest-core-kit';

@Controller('products')
export class ProductsController {
  // Documente automatiquement page, limit, sort dans Swagger
  @Get()
  @StandardPaginationQueries()
  findAll(@Query() paginateDto: PaginateDto) {
    return this.productsRepo.paginate(paginateDto);
  }

  // Renvoie le fichier brut sans l'enveloppe { success: true, data: ... }
  @Get('export/csv')
  @BypassTransform()
  exportCsv() {
    return 'id,name,price\n1,Demo,10';
  }
}
```

---

### 4. Validation de mot de passe (`@IsPasswordMatch`)

Dans vos DTOs d'inscription ou de réinitialisation de mot de passe :

```typescript
import { IsString, MinLength } from 'class-validator';
import { IsPasswordMatch } from 'nest-core-kit';

export class RegisterDto {
  @IsString()
  @MinLength(8)
  password: string;

  @IsPasswordMatch('password', { 
    message: 'Les mots de passe ne correspondent pas.' 
  })
  confirmPassword: string;
}
```

---

### 5. Authentification, Rôles & Sécurité

#### Configuration globale dans `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, JwtAuthGuard, RolesGuard } from 'nest-core-kit';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Toutes les routes protégées par défaut
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // Vérification automatique des rôles (@Roles / @RequireRoles)
    },
  ],
})
export class AppModule {}
```

#### Utilisation dans vos contrôleurs

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public, CurrentUser, Roles, RequireRoles, JwtPayload } from 'nest-core-kit';

@Controller('users')
export class UsersController {
  // Route ouverte à tous (sans token JWT)
  @Public()
  @Post('login')
  login() {
    return { token: 'jwt-token-here' };
  }

  // Récupération directe de l'utilisateur connecté
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  // Restreint aux administrateurs (supporte user.role.label, user.role, user.roles)
  @Roles('admin') // ou @RequireRoles('admin')
  @Get('admin-panel')
  getAdminPanel() {
    return { message: 'Bienvenue dans le panneau admin' };
  }
}
```

---

## 🛠️ Développement & Tests

```bash
# Compiler la bibliothèque (génère dist/)
pnpm run build

# Lancer la suite de tests unitaires (23 tests)
pnpm run test

# Lancer le serveur de démo / playground local
pnpm run start:dev
```

## 📄 Licence

MIT
