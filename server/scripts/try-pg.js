require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configs = [
  {
    name: 'direct-ipv6',
    host: 'db.ciwjsbcnxidurzgkxzfm.supabase.co',
    port: 5432,
    user: 'postgres',
    password: key,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    name: 'pooler-ap-south-tx',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ciwjsbcnxidurzgkxzfm',
    password: key,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    name: 'pooler-ap-south-session',
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.ciwjsbcnxidurzgkxzfm',
    password: key,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    name: 'pooler-aws-1',
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ciwjsbcnxidurzgkxzfm',
    password: key,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
];

(async () => {
  for (const cfg of configs) {
    const client = new Client({ ...cfg, connectionTimeoutMillis: 5000 });
    try {
      await client.connect();
      const r = await client.query('select current_user, current_database()');
      console.log(cfg.name, 'OK', r.rows[0]);
      await client.end();
    } catch (err) {
      console.log(cfg.name, 'FAIL', err.code || '', err.message.split('\n')[0]);
      try {
        await client.end();
      } catch {}
    }
  }

  const url = process.env.SUPABASE_URL;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/rls_auto_enable`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    console.log('rls_auto_enable', res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.log('rpc fail', e.message);
  }
})();
