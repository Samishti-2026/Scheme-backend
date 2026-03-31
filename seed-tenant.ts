/**
 * Inserts the "acme" tenant into commondb_2ghk with an encrypted connection URI.
 * Run with: npx ts-node -r tsconfig-paths/register seed-tenant.ts
 */
import 'dotenv/config';
import * as crypto from 'crypto';
import { Client } from 'pg';

const TENANT_URI = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

async function run() {
  const keyHex = process.env.DB_ENCRYPTION_KEY!;
  if (!keyHex || keyHex.length !== 64) throw new Error('DB_ENCRYPTION_KEY missing or invalid');

  const encryptedUri = encrypt(TENANT_URI, keyHex);
  console.log('URI encrypted successfully');

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  // Ensure slug is unique
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tenants_slug_key'
      ) THEN
        ALTER TABLE tenants ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
      END IF;
    END $$;
  `);

  // Upsert — safe to re-run
  const res = await client.query(`
    INSERT INTO tenants (tenant_name, slug, connection_uri, start_date, expiry_date)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug) DO UPDATE
      SET connection_uri = EXCLUDED.connection_uri,
          tenant_name    = EXCLUDED.tenant_name
    RETURNING tenant_id, tenant_name, slug
  `, ['Acme', 'acme', encryptedUri, '2025-01-01', '2027-12-31']);

  console.log('Tenant upserted:', res.rows[0]);
  await client.end();
}

run().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
