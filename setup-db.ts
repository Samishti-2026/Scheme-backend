/**
 * One-time script to create all tables in the common DB (Render).
 * Run with: npx ts-node -r tsconfig-paths/register setup-db.ts
 */
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Tenant } from './src/tenants/tenant.entity';
import { Customer } from './src/common/entities/customer.entity';
import { Material } from './src/common/entities/material.entity';
import { Billing } from './src/common/entities/billing.entity';
import { Payment } from './src/common/entities/payment.entity';

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
  entities: [Tenant, Customer, Material, Billing, Payment],
  synchronize: false,
});

async function run() {
  await ds.initialize();
  console.log('Connected to:', process.env.DB_DATABASE);

  await ds.synchronize(); // creates tables that don't exist, safe to re-run
  console.log('Tables created/verified successfully.');

  await ds.destroy();
}

run().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
