"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const tenants_connection_service_1 = require("./tenants-connection.service");
const tenants_service_1 = require("../tenants/tenants.service");
const crypto_service_1 = require("../common/crypto.service");
const winston_logger_1 = require("../common/winston.logger");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            crypto_service_1.CryptoService,
            tenants_connection_service_1.TenantsConnectionService,
            {
                provide: 'TENANT_CONNECTION',
                scope: common_1.Scope.REQUEST,
                useFactory: async (tenantsConnectionService, tenantsService) => {
                    const tenantId = tenantsService.getTenantId();
                    winston_logger_1.winstonInstance.debug(`TENANT_CONNECTION factory triggered`, {
                        context: 'DatabaseModule', tenantId,
                    });
                    if (tenantId === 'default') {
                        winston_logger_1.winstonInstance.debug(`No tenantId in JWT — returning null connection (pre-auth route)`, { context: 'DatabaseModule' });
                        return null;
                    }
                    const tenant = await tenantsService.findOne(parseInt(tenantId));
                    if (!tenant) {
                        winston_logger_1.winstonInstance.warn(`Tenant id="${tenantId}" not found in Common-DB`, { context: 'DatabaseModule' });
                        return null;
                    }
                    winston_logger_1.winstonInstance.debug(`Tenant found: "${tenant.name}" (id=${tenant.id})`, { context: 'DatabaseModule' });
                    const connection = await tenantsConnectionService.getTenantConnection(tenantId, tenant.connectionUri || '');
                    winston_logger_1.winstonInstance.info(`TENANT_CONNECTION ready for "${tenant.name}"`, { context: 'DatabaseModule' });
                    return connection;
                },
                inject: [tenants_connection_service_1.TenantsConnectionService, tenants_service_1.TenantsService],
            },
        ],
        exports: ['TENANT_CONNECTION', tenants_connection_service_1.TenantsConnectionService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map