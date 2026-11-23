import { Logger } from '@nestjs/common';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { PaginateDto, PaginatedResult } from '../common/pagination/paginate.dto';
export declare abstract class AbstractRepository<T extends AbstractEntity> {
    private readonly entityRepository;
    protected abstract readonly logger: Logger;
    constructor(entityRepository: Repository<T>);
    create(entityData: DeepPartial<T>): Promise<T>;
    findOne(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T>;
    findOneOrNull(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T | null>;
    findAll(where?: FindOptionsWhere<T>): Promise<T[]>;
    paginate(paginateDto: PaginateDto, where?: FindOptionsWhere<T>): Promise<PaginatedResult<T>>;
    update(where: FindOptionsWhere<T>, partialEntity: DeepPartial<T>): Promise<T>;
    softDelete(where: FindOptionsWhere<T>): Promise<void>;
    hardDelete(where: FindOptionsWhere<T>): Promise<void>;
}
