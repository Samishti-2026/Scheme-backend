import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Scheme } from '../schemes/scheme.entity';
import { SchemeConfig } from '../scheme-configs/scheme-config.entity';
import { Customer } from '../common/entities/customer.entity';
import { Material } from '../common/entities/material.entity';
import { Billing } from '../common/entities/billing.entity';
import { Payment } from '../common/entities/payment.entity';
import { CryptoService } from '../common/crypto.service';
import { winstonInstance as logger } from '../common/winston.logger';
import { Client } from 'pg';

const CTX = 'TenantConnection';

@Injectable()
export class TenantsConnectionService implements OnModuleDestroy {
  private connections: Map<string, DataSource> = new Map();

  constructor(
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {}

  async getTenantConnection(tenantId: string, connectionUri: string): Promise<DataSource> {
    logger.debug(`getTenantConnection called`, { context: CTX, tenantId });

    if (this.connections.has(tenantId)) {
      const cached = this.connections.get(tenantId)!;
      logger.debug(`Using cached connection`, { context: CTX, tenantId, initialized: cached.isInitialized });
      return cached.isInitialized ? cached : cached.initialize();
    }

    logger.debug(`No cached connection — creating new one`, { context: CTX, tenantId });

    const isEnc = this.cryptoService.isEncrypted(connectionUri);
    logger.debug(`connection_uri encrypted: ${isEnc}`, { context: CTX });

    const decrypted = isEnc ? this.cryptoService.decrypt(connectionUri) : connectionUri;
    // Never log the decrypted URI — it contains credentials

    // If it's a full postgresql:// URI, extract just the database name for the DataSource config
    let activeDbName = decrypted;
    if (decrypted?.startsWith('postgresql://') || decrypted?.startsWith('postgres://')) {
      activeDbName = new URL(decrypted).pathname.replace('/', '');
      logger.debug(`Extracted DB name from URI: "${activeDbName}"`, { context: CTX });
    }
    activeDbName = activeDbName || `tenant_${tenantId}`;

    await this.ensureDatabaseExists(activeDbName);

    const host = this.configService.get<string>('DB_HOST', 'localhost');
    const port = this.configService.get<number>('DB_PORT', 5432);
    const user = this.configService.get<string>('DB_USERNAME', 'postgres');

    logger.info(`Connecting to ${host}:${port}/${activeDbName}`, { context: CTX, tenantId });

    const options: DataSourceOptions = {
      type: 'postgres',
      host,
      port,
      username: user,
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: activeDbName,
      entities: [Scheme, SchemeConfig, Customer, Material, Billing, Payment],
      synchronize: false,
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    this.connections.set(tenantId, dataSource);

    logger.info(`DataSource initialized for tenant "${tenantId}" → DB "${activeDbName}"`, {
      context: CTX,
      cachedTenants: [...this.connections.keys()],
    });

    return dataSource;
  }

  private async ensureDatabaseExists(dbName: string) {
    logger.debug(`Checking if DB "${dbName}" exists`, { context: CTX });

    const client = new Client({
      host:     this.configService.get<string>('DB_HOST', 'localhost'),
      port:     this.configService.get<number>('DB_PORT', 5432),
      user:     this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: 'postgres',
    });

    try {
      await client.connect();
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
      if (res.rowCount === 0) {
        logger.warn(`DB "${dbName}" not found — creating it`, { context: CTX });
        await client.query(`CREATE DATABASE "${dbName}"`);
        logger.info(`DB "${dbName}" created`, { context: CTX });
      } else {
        logger.debug(`DB "${dbName}" already exists`, { context: CTX });
      }
    } catch (err) {
      logger.error(`Error checking/creating DB "${dbName}"`, err.message, { context: CTX });
    } finally {
      await client.end();
    }
  }

  async onModuleDestroy() {
    logger.info(`Destroying all cached connections`, { context: CTX });
    for (const [id, conn] of this.connections.entries()) {
      if (conn.isInitialized) {
        await conn.destroy();
        logger.debug(`Closed connection for tenant "${id}"`, { context: CTX });
      }
    }
  }
}
