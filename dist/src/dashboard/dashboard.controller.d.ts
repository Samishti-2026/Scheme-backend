export declare class DashboardController {
    getSummary(): Promise<{
        quarterLabel: string;
        changePercent: string;
        totalSales: string;
        salesTarget: string;
        progressPercent: number;
    }>;
    getUpcomingSchemes(): Promise<{
        id: number;
        name: string;
        startDate: string;
        target: string;
    }[]>;
}
