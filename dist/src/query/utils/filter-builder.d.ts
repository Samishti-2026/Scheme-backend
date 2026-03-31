export interface FilterDef {
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
}
export declare function buildMatch(filters: FilterDef[], matchLogic?: 'AND' | 'OR'): {
    whereClause: string;
    params: any[];
};
