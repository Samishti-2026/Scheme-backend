import { DataSource } from 'typeorm';
export interface QueryFilter {
    collection: string;
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
}
export interface AggregationOp {
    operator: 'sum' | 'avg' | 'min' | 'max' | 'count';
    collection: string;
    field: string;
    alias?: string;
}
export interface GroupByField {
    collection: string;
    field: string;
}
export interface HavingFilter {
    field: string;
    operator: string;
    value: any;
}
export declare class QueryService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private validateFilter;
    private resolveRoot;
    private resolveField;
    execute(filters?: QueryFilter[], matchLogic?: 'AND' | 'OR', aggregation?: AggregationOp[], having?: HavingFilter[], groupBy?: GroupByField[]): Promise<{
        type: string;
        query: string;
        aggregation_data: any;
        aggregation_count: any;
        data?: undefined;
        count?: undefined;
    } | {
        type: string;
        query: string;
        data: any;
        count: any;
        aggregation_data?: undefined;
        aggregation_count?: undefined;
    }>;
    getFieldValues(collection: string, field: string): Promise<string[]>;
}
