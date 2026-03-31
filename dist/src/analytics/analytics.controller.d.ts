export declare class AnalyticsController {
    getKpis(): Promise<{
        totalRevenue: string;
        revenueChange: string;
        activeSchemes: number;
        schemesChange: string;
        avgOrderValue: string;
        avgOrderChange: string;
    }>;
    getChart(): Promise<{
        name: string;
        value: number;
    }[]>;
}
