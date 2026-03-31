/**
 * Creates missing tables on Render scheme_tool_db that have no TypeORM entities.
 * Run with: node setup-missing-tables.js
 */
const { Client } = require('pg');

const TARGET_URL = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

async function run() {
  const client = new Client({ connectionString: TARGET_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id           SERIAL PRIMARY KEY,
      sku          VARCHAR(100),
      name         VARCHAR(255),
      category     VARCHAR(100),
      "subCategory" VARCHAR(100),
      description  TEXT,
      "unitPrice"  NUMERIC,
      unit         VARCHAR(50),
      "isActive"   BOOLEAN DEFAULT true,
      "createdAt"  TIMESTAMP DEFAULT NOW(),
      "updatedAt"  TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('[OK] products');

  await client.query(`
    CREATE TABLE IF NOT EXISTS recipients (
      id             SERIAL PRIMARY KEY,
      name           VARCHAR(255),
      "currentTO"    NUMERIC,
      "avgDaily"     NUMERIC,
      category       VARCHAR(100),
      type           VARCHAR(100),
      region         VARCHAR(100),
      "paymentStatus" VARCHAR(50),
      "invoiceDate"  VARCHAR(50),
      "paymentDate"  VARCHAR(50),
      products       TEXT,
      "recipientType" VARCHAR(100)
    )
  `);
  console.log('[OK] recipients');

  await client.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id              SERIAL PRIMARY KEY,
      "displayName"   VARCHAR(150),
      email           VARCHAR(255),
      "emailAlerts"   BOOLEAN DEFAULT false,
      "weeklyReports" BOOLEAN DEFAULT false,
      "systemUpdates" BOOLEAN DEFAULT false
    )
  `);
  console.log('[OK] settings');

  console.log('\nAll missing tables created on Render.');
  await client.end();
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
