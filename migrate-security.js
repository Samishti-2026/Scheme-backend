/**
 * migrate-security.js
 *
 * One-time migration script:
 *  1. Encrypts all plaintext connection_uri values in Common-DB (tenants table)
 *  2. Bcrypt-hashes all plaintext passwords in each tenant DB (users table)
 *
 * Run once:  node migrate-security.js
 * Safe to re-run — skips already-encrypted/hashed values.
 */

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// ── AES-256-CBC helpers (mirrors CryptoService) ──────────────────────────────
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const KEY_HEX = process.env.DB_ENCRYPTION_KEY;

if (!KEY_HEX || KEY_HEX.length !== 64) {
  console.error('❌  DB_ENCRYPTION_KEY must be a 64-char hex string in .env');
  process.exit(1);
}

const KEY = Buffer.from(KEY_HEX, 'hex');

function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function isEncrypted(value) {
  return /^[0-9a-f]{32}:[0-9a-f]+$/i.test(value);
}

// ── DB connection config ──────────────────────────────────────────────────────
const BASE_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
};

const BCRYPT_ROUNDS = 12;

// ── Step 1: Encrypt connection_uri in Common-DB ───────────────────────────────
async function migrateConnectionUris() {
  console.log('\n── Step 1: Encrypting connection_uri in Common-DB ──────────────');
  const client = new Client({ ...BASE_CONFIG, database: process.env.DB_DATABASE || 'Common-DB' });
  await client.connect();

  const { rows: tenants } = await client.query(
    `SELECT tenant_id, tenant_name, connection_uri FROM tenants WHERE connection_uri IS NOT NULL`
  );

  console.log(`   Found ${tenants.length} tenant(s)`);
  let updated = 0;

  for (const tenant of tenants) {
    const uri = tenant.connection_uri;

    if (isEncrypted(uri)) {
      console.log(`   ✓ [${tenant.tenant_name}] already encrypted — skipping`);
      continue;
    }

    const encrypted = encrypt(uri);
    await client.query(
      `UPDATE tenants SET connection_uri = $1 WHERE tenant_id = $2`,
      [encrypted, tenant.tenant_id]
    );
    console.log(`   🔒 [${tenant.tenant_name}] encrypted`);
    updated++;
  }

  console.log(`   Done — ${updated} URI(s) encrypted, ${tenants.length - updated} skipped`);
  await client.end();

  // Return tenants list for step 2
  const { rows: all } = await (async () => {
    const c2 = new Client({ ...BASE_CONFIG, database: process.env.DB_DATABASE || 'Common-DB' });
    await c2.connect();
    const r = await c2.query(`SELECT tenant_id, tenant_name, connection_uri FROM tenants WHERE connection_uri IS NOT NULL`);
    await c2.end();
    return r;
  })();
  return all;
}

// ── Step 2: Bcrypt-hash passwords in each tenant DB ──────────────────────────
async function migratePasswords(tenants) {
  console.log('\n── Step 2: Bcrypt-hashing passwords in tenant DBs ──────────────');

  for (const tenant of tenants) {
    // Decrypt the URI to get the actual DB name
    let dbName = tenant.connection_uri;
    if (isEncrypted(dbName)) {
      const [ivHex, encHex] = dbName.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const enc = Buffer.from(encHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
      dbName = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    }

    // Strip postgresql:// URI to just the DB name if needed
    if (dbName.startsWith('postgresql://') || dbName.startsWith('postgres://')) {
      try { dbName = new URL(dbName).pathname.replace('/', ''); } catch {}
    }

    console.log(`\n   Tenant: ${tenant.tenant_name} → DB: ${dbName}`);

    let tenantClient;
    try {
      tenantClient = new Client({ ...BASE_CONFIG, database: dbName });
      await tenantClient.connect();
    } catch (err) {
      console.warn(`   ⚠️  Could not connect to "${dbName}": ${err.message} — skipping`);
      continue;
    }

    // Check if users table exists
    const { rows: tableCheck } = await tenantClient.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'users' LIMIT 1`
    );
    if (tableCheck.length === 0) {
      console.log(`   ℹ️  No users table found — skipping`);
      await tenantClient.end();
      continue;
    }

    // Auto-detect schema: new schema uses 'id'+'password', legacy uses 'user_id'+'password_hash'
    const { rows: cols } = await tenantClient.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
    );
    const colNames = cols.map(c => c.column_name);
    const idCol  = colNames.includes('id') ? 'id' : 'user_id';
    const pwdCol = colNames.includes('password') ? 'password' : 'password_hash';

    console.log(`   Schema: id=${idCol}, password=${pwdCol}`);

    const { rows: users } = await tenantClient.query(
      `SELECT ${idCol} as uid, username, ${pwdCol} as pwd FROM users WHERE ${pwdCol} IS NOT NULL`
    );

    console.log(`   Found ${users.length} user(s)`);
    let hashed = 0;

    for (const user of users) {
      if (user.pwd.startsWith('$2')) {
        console.log(`   ✓ [${user.username}] already hashed — skipping`);
        continue;
      }

      const hash = await bcrypt.hash(user.pwd, BCRYPT_ROUNDS);
      await tenantClient.query(
        `UPDATE users SET ${pwdCol} = $1 WHERE ${idCol} = $2`,
        [hash, user.uid]
      );
      console.log(`   🔑 [${user.username}] hashed`);
      hashed++;
    }

    console.log(`   Done — ${hashed} password(s) hashed, ${users.length - hashed} skipped`);
    await tenantClient.end();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('🚀 Security migration starting...');
  try {
    const tenants = await migrateConnectionUris();
    await migratePasswords(tenants);
    console.log('\n✅  Migration complete.\n');
  } catch (err) {
    console.error('\n❌  Migration failed:', err.message);
    process.exit(1);
  }
})();
