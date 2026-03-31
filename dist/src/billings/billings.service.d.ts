import { DataSource } from 'typeorm';
import { Billing } from '../common/entities/billing.entity';
export declare class BillingsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(): Promise<Billing[]>;
    findOne(billing_doc: number): Promise<Billing | null>;
    create(data: Partial<Billing>): Promise<Billing>;
}
