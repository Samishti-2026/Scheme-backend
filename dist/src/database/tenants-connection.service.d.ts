import { OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto.service';
export declare class TenantsConnectionService implements OnModuleDestroy {
    private configService;
    private cryptoService;
    private connections;
    constructor(configService: ConfigService, cryptoService: CryptoService);
    getTenantConnection(tenantId: string, connectionUri: string): Promise<DataSource>;
    private ensureDatabaseExists;
    onModuleDestroy(): Promise<void>;
}
