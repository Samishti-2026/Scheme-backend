/**
 * One-time script to create all tables in the tenant DB (scheme_tool_db on Render).
 * Run with: npx ts-node -r tsconfig-paths/register setup-tenant-db.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Scheme } from './src/schemes/scheme.entity';
import { SchemeConfig } from './src/scheme-configs/scheme-config.entity';
import { Customer } from './src/common/entities/customer.entity';
import { Material } from './src/common/entities/material.entity';
import { Billing } from './src/common/entities/billing.entity';
import { Payment } from './src/common/entities/payment.entity';

const TENANT_DB_URL = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

const ds = new DataSource({
  type: 'postgres',
  url: TENANT_DB_URL,
  ssl: { rejectUnauthorized: false },
  entities: [Scheme, SchemeConfig, Customer, Material, Billing, Payment],
  synchronize: false,
});

async function run() {
  await ds.initialize();
  console.log('Connected to: scheme_tool_db');

  await ds.synchronize(); // creates tables that don't exist, safe to re-run
  console.log('Tenant tables created/verified successfully.');

  await ds.destroy();
}

run().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
