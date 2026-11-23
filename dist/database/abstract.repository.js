"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRepository = void 0;
const common_1 = require("@nestjs/common");
class AbstractRepository {
    entityRepository;
    constructor(entityRepository) {
        this.entityRepository = entityRepository;
    }
    async create(entityData) {
        const entity = this.entityRepository.create(entityData);
        return this.entityRepository.save(entity);
    }
    async findOne(where, options) {
        const entity = await this.entityRepository.findOne({
            where,
            ...options,
        });
        if (!entity) {
            this.logger.warn(`Entité non trouvée pour: ${JSON.stringify(where)}`);
            throw new common_1.NotFoundException('Ressource introuvable.');
        }
        return entity;
    }
    async findOneOrNull(where, options) {
        return this.entityRepository.findOne({ where, ...options });
    }
    async findAll(where) {
        return this.entityRepository.find({ where });
    }
    async paginate(paginateDto, where) {
        const { page, limit, skip } = paginateDto;
        let order;
        if (paginateDto.sort) {
            const [field, direction] = paginateDto.sort.split(':');
            order = {
                [field]: direction?.toUpperCase() ?? 'ASC',
            };
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
    async update(where, partialEntity) {
        const entity = await this.findOne(where);
        this.entityRepository.merge(entity, partialEntity);
        return this.entityRepository.save(entity);
    }
    async softDelete(where) {
        await this.findOne(where);
        await this.entityRepository.softDelete(where);
    }
    async hardDelete(where) {
        await this.findOne(where);
        await this.entityRepository.delete(where);
    }
}
exports.AbstractRepository = AbstractRepository;
//# sourceMappingURL=abstract.repository.js.map