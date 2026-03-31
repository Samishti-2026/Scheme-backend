import { DataSource } from 'typeorm';
interface FilterRule {
    collection: string;
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
}
export declare class RecipientsController {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private queryCustomers;
    findAll(recipientType: string): Promise<any>;
    queryWithFilters(body: {
        recipientType?: string;
        filters?: FilterRule[];
    }): Promise<any>;
    getFilterOptions(): Promise<{
        name: string;
        options: string[];
    }[]>;
    getRecipientTypes(): {
        key: string;
        label: string;
    }[];
}
export {};
