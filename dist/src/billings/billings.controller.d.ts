import { BillingsService } from './billings.service';
import { Billing } from '../common/entities/billing.entity';
export declare class BillingsController {
    private readonly service;
    constructor(service: BillingsService);
    findAll(): Promise<Billing[]>;
    findOne(id: string): Promise<Billing | null>;
    create(data: Partial<Billing>): Promise<Billing>;
}
