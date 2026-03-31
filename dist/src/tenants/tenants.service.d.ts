import type { Request } from 'express';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CryptoService } from '../common/crypto.service';
export declare class TenantsService {
    private readonly request;
    private readonly repository;
    private readonly crypto;
    constructor(request: Request, repository: Repository<Tenant>, crypto: CryptoService);
    getTenantId(): string;
    findAll(): Promise<Tenant[]>;
    create(data: Partial<Tenant>): Promise<Tenant>;
    findOne(id: number): Promise<Tenant | null>;
    findBySlug(slug: string): Promise<Tenant | null>;
    decryptConnectionUri(encryptedDbName: string): string;
}
