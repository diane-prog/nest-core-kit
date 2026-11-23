export declare class PaginateDto {
    page: number;
    limit: number;
    sort?: string;
    get skip(): number;
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
export declare const StandardPaginationQueries: (options?: PaginationQueryOptions) => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
