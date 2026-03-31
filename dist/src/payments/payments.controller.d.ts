import { PaymentsService } from './payments.service';
import { Payment } from '../common/entities/payment.entity';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    findAll(): Promise<Payment[]>;
    findOne(company_code: string, bill_doc: string, customer_number: string, accounting_document: string, item_num: string): Promise<Payment | null>;
    create(data: Partial<Payment>): Promise<Payment>;
}
