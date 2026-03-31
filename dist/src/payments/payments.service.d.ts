import { DataSource } from 'typeorm';
import { Payment } from '../common/entities/payment.entity';
export declare class PaymentsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(): Promise<Payment[]>;
    findOne(company_code: number, bill_doc: number, customer_number: number, accounting_document: number, item_num: number): Promise<Payment | null>;
    create(data: Partial<Payment>): Promise<Payment>;
}
