import { CustomersService } from './customers.service';
import { Customer } from '../common/entities/customer.entity';
export declare class CustomersController {
    private readonly service;
    constructor(service: CustomersService);
    findAll(): Promise<Customer[]>;
    findOne(id: string): Promise<Customer | null>;
    create(data: Partial<Customer>): Promise<Customer>;
}
