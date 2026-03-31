import { DataSource } from 'typeorm';
import { Scheme } from './scheme.entity';
export interface SchemeFilters {
    region?: string;
    type?: string;
    search?: string;
    status?: string;
}
export declare class SchemesService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    private get repository();
    findAll(filters?: SchemeFilters): Promise<Scheme[]>;
    findOne(id: string): Promise<Scheme | null>;
    create(data: Partial<Scheme>): Promise<Scheme>;
    update(id: string, data: Partial<Scheme>): Promise<Scheme | null>;
    remove(id: string): Promise<void>;
}
