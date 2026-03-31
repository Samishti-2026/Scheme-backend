import { DataSource } from 'typeorm';
import { Customer } from '../common/entities/customer.entity';
export declare class CustomersService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(): Promise<Customer[]>;
    findOne(customer_code: number): Promise<Customer | null>;
    create(data: Partial<Customer>): Promise<Customer>;
}
