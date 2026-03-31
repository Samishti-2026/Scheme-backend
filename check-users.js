require('dotenv').config();
const { Client } = require('pg');
const c = new Client({ host: process.env.DB_HOST, port: +process.env.DB_PORT, user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: 'scheme_tool_db' });
c.connect()
  .then(() => c.query("SELECT column_name FROM information_schema.columns WHERE table_name='users'"))
  .then(r => { console.log('scheme_tool_db users cols:', r.rows); return c.query('SELECT * FROM users LIMIT 3'); })
  .then(r => { console.log('rows:', r.rows); return c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
