"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const tenants_connection_service_1 = require("./src/database/tenants-connection.service");
async function provisionAll() {
    console.log('Starting tenant-wide schema provisioning...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const connectionService = app.get(tenants_connection_service_1.TenantsConnectionService);
    const { Client } = await import('pg');
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '0807',
        database: 'Common_DB',
    });
    try {
        await client.connect();
        const res = await client.query('SELECT id, dbname FROM tenant');
        const tenants = res.rows;
        for (const tenant of tenants) {
            if (tenant.dbname) {
                console.log(`Provisioning database: ${tenant.dbname} (Tenant ID: ${tenant.id})...`);
                try {
                    const ds = await connectionService.getTenantConnection(String(tenant.id), tenant.dbname);
                    console.log(`Successfully provisioned/synchronized ${tenant.dbname}`);
                }
                catch (err) {
                    console.error(`Failed to provision ${tenant.dbname}:`, err.message);
                }
            }
        }
        console.log('Provisioning complete.');
    }
    catch (err) {
        console.error('Provisioning error:', err.message);
    }
    finally {
        await client.end();
        await app.close();
    }
}
provisionAll();
//# sourceMappingURL=provision-tenants.js.map