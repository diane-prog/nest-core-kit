"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardPaginationQueries = exports.PaginateDto = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PaginateDto {
    page = 1;
    limit = 10;
    sort;
    get skip() {
        return (this.page - 1) * this.limit;
    }
}
exports.PaginateDto = PaginateDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginateDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 10, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginateDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Champ de tri, ex: createdAt:DESC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginateDto.prototype, "sort", void 0);
const StandardPaginationQueries = (options) => {
    return (0, common_1.applyDecorators)((0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        example: options?.defaultPage ?? 1,
        description: 'Numéro de page',
    }), (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        example: options?.defaultLimit ?? 10,
        description: "Nombre d'éléments par page",
    }), (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false,
        type: String,
        description: 'Champ et direction de tri (ex: createdAt:DESC)',
        example: 'createdAt:DESC',
    }));
};
exports.StandardPaginationQueries = StandardPaginationQueries;
//# sourceMappingURL=paginate.dto.js.map