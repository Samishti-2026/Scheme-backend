import { TenantsService } from './tenants.service';
import { Tenant } from './tenant.entity';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    findAll(): Promise<{
        id: number;
        name: string;
        code: string;
        isActive: boolean;
        color: string;
        logoUrl: null;
        industry: null;
        startDate: Date;
        expiryDate: Date;
    }[]>;
    create(data: Partial<Tenant>): Promise<{
        id: number;
        name: string;
        code: string;
        isActive: boolean;
        color: string;
        logoUrl: null;
        industry: null;
        startDate: Date;
        expiryDate: Date;
    }>;
    findOne(id: string): Promise<{
        id: number;
        name: string;
        code: string;
        isActive: boolean;
        color: string;
        logoUrl: null;
        industry: null;
        startDate: Date;
        expiryDate: Date;
    } | null>;
}
