import { applyDecorators } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';

export class PaginateDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Champ de tri, ex: createdAt:DESC' })
  @IsOptional()
  @IsString()
  sort?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationQueryOptions {
  defaultPage?: number;
  defaultLimit?: number;
}

/**
 * Décorateur Swagger combiné : documente automatiquement dans la spécification OpenAPI
 * les paramètres de query standard pour la pagination (page, limit, sort).
 *
 * Exemple :
 *   @Get()
 *   @StandardPaginationQueries()
 *   findAll(@Query() paginateDto: PaginateDto) { ... }
 */
export const StandardPaginationQueries = (options?: PaginationQueryOptions) => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: options?.defaultPage ?? 1,
      description: 'Numéro de page',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: options?.defaultLimit ?? 10,
      description: "Nombre d'éléments par page",
    }),
    ApiQuery({
      name: 'sort',
      required: false,
      type: String,
      description: 'Champ et direction de tri (ex: createdAt:DESC)',
      example: 'createdAt:DESC',
    }),
  );
};
