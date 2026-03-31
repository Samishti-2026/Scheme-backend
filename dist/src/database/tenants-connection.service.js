"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsConnectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const scheme_entity_1 = require("../schemes/scheme.entity");
const scheme_config_entity_1 = require("../scheme-configs/scheme-config.entity");
const customer_entity_1 = require("../common/entities/customer.entity");
const material_entity_1 = require("../common/entities/material.entity");
const billing_entity_1 = require("../common/entities/billing.entity");
const payment_entity_1 = require("../common/entities/payment.entity");
const crypto_service_1 = require("../common/crypto.service");
const winston_logger_1 = require("../common/winston.logger");
const pg_1 = require("pg");
const CTX = 'TenantConnection';
let TenantsConnectionService = class TenantsConnectionService {
    configService;
    cryptoService;
    connections = new Map();
    constructor(configService, cryptoService) {
        this.configService = configService;
        this.cryptoService = cryptoService;
    }
    async getTenantConnection(tenantId, connectionUri) {
        winston_logger_1.winstonInstance.debug(`getTenantConnection called`, { context: CTX, tenantId });
        if (this.connections.has(tenantId)) {
            const cached = this.connections.get(tenantId);
            winston_logger_1.winstonInstance.debug(`Using cached connection`, { context: CTX, tenantId, initialized: cached.isInitialized });
            return cached.isInitialized ? cached : cached.initialize();
        }
        winston_logger_1.winstonInstance.debug(`No cached connection — creating new one`, { context: CTX, tenantId });
        const isEnc = this.cryptoService.isEncrypted(connectionUri);
        winston_logger_1.winstonInstance.debug(`connection_uri encrypted: ${isEnc}`, { context: CTX });
        const decrypted = isEnc ? this.cryptoService.decrypt(connectionUri) : connectionUri;
        const isFullUri = decrypted?.startsWith('postgresql://') || decrypted?.startsWith('postgres://');
        let options;
        if (isFullUri) {
            const parsed = new URL(decrypted);
            winston_logger_1.winstonInstance.info(`Connecting via full URI to ${parsed.hostname}${parsed.pathname}`, { context: CTX, tenantId });
            options = {
                type: 'postgres',
                url: decrypted,
                ssl: { rejectUnauthorized: false },
                entities: [scheme_entity_1.Scheme, scheme_config_entity_1.SchemeConfig, customer_entity_1.Customer, material_entity_1.Material, billing_entity_1.Billing, payment_entity_1.Payment],
                synchronize: false,
            };
        }
        else {
            const activeDbName = decrypted || `tenant_${tenantId}`;
            await this.ensureDatabaseExists(activeDbName);
            const host = this.configService.get('DB_HOST', 'localhost');
            const port = this.configService.get('DB_PORT', 5432);
            const user = this.configService.get('DB_USERNAME', 'postgres');
            winston_logger_1.winstonInstance.info(`Connecting to ${host}:${port}/${activeDbName}`, { context: CTX, tenantId });
            options = {
                type: 'postgres',
                host,
                port,
                username: user,
                password: this.configService.get('DB_PASSWORD', 'postgres'),
                database: activeDbName,
                entities: [scheme_entity_1.Scheme, scheme_config_entity_1.SchemeConfig, customer_entity_1.Customer, material_entity_1.Material, billing_entity_1.Billing, payment_entity_1.Payment],
                synchronize: false,
            };
        }
        const dataSource = new typeorm_1.DataSource(options);
        await dataSource.initialize();
        this.connections.set(tenantId, dataSource);
        winston_logger_1.winstonInstance.info(`DataSource initialized for tenant "${tenantId}"`, {
            context: CTX,
            cachedTenants: [...this.connections.keys()],
        });
        return dataSource;
    }
    async ensureDatabaseExists(dbName) {
        winston_logger_1.winstonInstance.debug(`Checking if DB "${dbName}" exists`, { context: CTX });
        const client = new pg_1.Client({
            host: this.configService.get('DB_HOST', 'localhost'),
            port: this.configService.get('DB_PORT', 5432),
            user: this.configService.get('DB_USERNAME', 'postgres'),
            password: this.configService.get('DB_PASSWORD', 'postgres'),
            database: 'postgres',
        });
        try {
            await client.connect();
            const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
            if (res.rowCount === 0) {
                winston_logger_1.winstonInstance.warn(`DB "${dbName}" not found — creating it`, { context: CTX });
                await client.query(`CREATE DATABASE "${dbName}"`);
                winston_logger_1.winstonInstance.info(`DB "${dbName}" created`, { context: CTX });
            }
            else {
                winston_logger_1.winstonInstance.debug(`DB "${dbName}" already exists`, { context: CTX });
            }
        }
        catch (err) {
            winston_logger_1.winstonInstance.error(`Error checking/creating DB "${dbName}"`, err.message, { context: CTX });
        }
        finally {
            await client.end();
        }
    }
    async onModuleDestroy() {
        winston_logger_1.winstonInstance.info(`Destroying all cached connections`, { context: CTX });
        for (const [id, conn] of this.connections.entries()) {
            if (conn.isInitialized) {
                await conn.destroy();
                winston_logger_1.winstonInstance.debug(`Closed connection for tenant "${id}"`, { context: CTX });
            }
        }
    }
};
exports.TenantsConnectionService = TenantsConnectionService;
exports.TenantsConnectionService = TenantsConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        crypto_service_1.CryptoService])
], TenantsConnectionService);
//# sourceMappingURL=tenants-connection.service.js.map