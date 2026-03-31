import { DataSource } from 'typeorm';
export declare class SettingsController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getSettings(): Promise<any>;
    updateSettings(data: Record<string, any>): Promise<{
        displayName: string;
        email: string;
        emailAlerts: boolean;
        weeklyReports: boolean;
        systemUpdates: boolean;
    }>;
}
