import { QueryService, QueryFilter, AggregationOp, GroupByField, HavingFilter } from './query.service';
interface ExecuteQueryDto {
    filters?: QueryFilter[];
    matchLogic?: 'AND' | 'OR';
    aggregation?: AggregationOp[];
    having?: HavingFilter[];
    groupBy?: GroupByField[];
}
export declare class QueryController {
    private readonly queryService;
    constructor(queryService: QueryService);
    execute(body: ExecuteQueryDto): Promise<{
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
    getOperators(): {
        key: string;
        label: string;
    }[];
}
export {};
