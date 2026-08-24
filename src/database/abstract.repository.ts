import { Logger, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import {
  PaginateDto,
  PaginatedResult,
} from '../common/pagination/paginate.dto';

/**
 * Repository de base à étendre pour chaque entité.
 * Fournit les opérations CRUD courantes + pagination, avec des
 * messages d'erreur cohérents et un logger prêt à l'emploi.
 *
 * Exemple :
 *   @Injectable()
 *   export class UsersRepository extends AbstractRepository<User> {
 *     constructor(@InjectRepository(User) repo: Repository<User>) {
 *       super(repo);
 *     }
 *   }
 */
export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(private readonly entityRepository: Repository<T>) {}

  async create(entityData: DeepPartial<T>): Promise<T> {
    const entity = this.entityRepository.create(entityData);
    return this.entityRepository.save(entity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T> {
    const entity = await this.entityRepository.findOne({
      where,
      ...options,
    });

    if (!entity) {
      this.logger.warn(`Entité non trouvée pour: ${JSON.stringify(where)}`);
      throw new NotFoundException('Ressource introuvable.');
    }

    return entity;
  }

  async findOneOrNull(
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    return this.entityRepository.findOne({ where, ...options });
  }

  async findAll(where?: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.find({ where });
  }

  async paginate(
    paginateDto: PaginateDto,
    where?: FindOptionsWhere<T>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, skip } = paginateDto;

    let order: FindOptionsOrder<T> | undefined;
    if (paginateDto.sort) {
      const [field, direction] = paginateDto.sort.split(':');
      order = {
        [field]: (direction?.toUpperCase() as 'ASC' | 'DESC') ?? 'ASC',
      } as FindOptionsOrder<T>;
    }

    const [data, total] = await this.entityRepository.findAndCount({
      where,
      skip,
      take: limit,
      order,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    where: FindOptionsWhere<T>,
    partialEntity: DeepPartial<T>,
  ): Promise<T> {
    const entity = await this.findOne(where);
    this.entityRepository.merge(entity, partialEntity as any);
    return this.entityRepository.save(entity);
  }

  async softDelete(where: FindOptionsWhere<T>): Promise<void> {
    await this.findOne(where);
    await this.entityRepository.softDelete(where);
  }

  async hardDelete(where: FindOptionsWhere<T>): Promise<void> {
    await this.findOne(where);
    await this.entityRepository.delete(where);
  }
}
