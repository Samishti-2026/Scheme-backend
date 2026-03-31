interface JoinDef {
    type: string;
    table: string;
    condition: string;
}
export declare function buildJoinPlan(root: string, filters: {
    collection: string;
}[]): JoinDef[];
export {};
