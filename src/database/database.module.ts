import { Module, Scope, Global } from '@nestjs/common';
import { TenantsConnectionService } from './tenants-connection.service';
import { TenantsService } from '../tenants/tenants.service';
import { CryptoService } from '../common/crypto.service';
import { winstonInstance as logger } from '../common/winston.logger';

@Global()
@Module({
  providers: [
    CryptoService,
    TenantsConnectionService,
    {
      provide: 'TENANT_CONNECTION',
      scope: Scope.REQUEST,
      useFactory: async (
        tenantsConnectionService: TenantsConnectionService,
        tenantsService: TenantsService,
      ) => {
        const tenantId = tenantsService.getTenantId();

        logger.debug(`TENANT_CONNECTION factory triggered`, {
          context: 'DatabaseModule', tenantId,
        });

        if (tenantId === 'default') {
          logger.debug(`No tenantId in JWT — returning null connection (pre-auth route)`, { context: 'DatabaseModule' });
          return null;
        }

        const tenant = await tenantsService.findOne(parseInt(tenantId));

        if (!tenant) {
          logger.warn(`Tenant id="${tenantId}" not found in Common-DB`, { context: 'DatabaseModule' });
          return null;
        }

        logger.debug(`Tenant found: "${tenant.name}" (id=${tenant.id})`, { context: 'DatabaseModule' });

        const connection = await tenantsConnectionService.getTenantConnection(tenantId, tenant.connectionUri || '');

        logger.info(`TENANT_CONNECTION ready for "${tenant.name}"`, { context: 'DatabaseModule' });
        return connection;
      },
      inject: [TenantsConnectionService, TenantsService],
    },
  ],
  exports: ['TENANT_CONNECTION', TenantsConnectionService],
})
export class DatabaseModule {}
