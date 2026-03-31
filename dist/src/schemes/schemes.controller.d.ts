import { SchemesService } from './schemes.service';
import { Scheme } from './scheme.entity';
export declare class SchemesController {
    private readonly schemesService;
    constructor(schemesService: SchemesService);
    findAll(region?: string, type?: string, search?: string, status?: string): Promise<Scheme[]>;
    findOne(id: string): Promise<Scheme | null>;
    create(data: Partial<Scheme>): Promise<Scheme>;
    update(id: string, data: Partial<Scheme>): Promise<Scheme | null>;
    remove(id: string): Promise<void>;
}
